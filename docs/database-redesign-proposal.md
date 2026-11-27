# Tayhlor database redesign proposal — REVIEW ONLY

Status: **PROPOSAL. Nothing has been applied.** No Prisma schema change, no migration file, and no database command has been run for this redesign.

## 1. Objective

Reorganise the database so tables are logically grouped, names are consistent with the PRD, required columns exist, relationships and constraints are explicit, and the structure is easy to understand and extend — while preserving all existing rows.

## 2. Sources reviewed

- `docs/tayhlor_prd_v0.4.md` — Sections 4.2, 7, 8.4, 8.5, 9, 10, 14; this is the source of truth.
- All `.agents/rules/*.md` — especially `database.md`, `data-model.md`, `security.md`, `accounts-and-access.md`, `order-lifecycle.md`, `payments.md`, `faq-assistant.md`, `privacy.md`, `jobs.md`.
- All 8 existing migration SQL files and both existing run sheets.
- Application code under `src/`: auth routes, `src/lib/auth.ts`, `src/lib/prisma.ts`, verification/reset helpers, customer dashboard.
- `Task 04-server-security/docs/schema.md` and `docs/migrations.md` — older coursework design notes, **not executable**, and conflicting with the current PRD in several places.

### Application-code findings

- Only `prisma.user` is used today (register, sign-in, verify, resend, password reset). No order, payment, measurement, or FAQ code exists yet.
- Sessions use `session strategy: 'jwt'` (`src/lib/auth.ts`), so the new `Session` table is inert until a separate decision switches strategy.
- Both `emailVerified` and `emailVerifiedAt` are read by the app. Password reset is a stateless HMAC token derived from `passwordHash`, so it needs no new DB columns.
- `recordEnvironment` is set only on user registration today; future code must propagate it to every related record (DAT-07).

Because orders, payments, and FAQ are not implemented, most structural changes have **low immediate code impact**; the main code work is adding `businessId` to the session and to all new queries.

## 3. What is already correct — keep unchanged

- Integer kobo money columns (DAT-02), immutable `measurementsSnapshot` JSON (DAT-03).
- Append-only audit shape; no `onDelete: Cascade` from `User` to `Order`, `Payment`, `OrderStatusAudit`, or `Fitting` (DAT-04, DAT-13).
- Dedicated `Fitting` model with `SATISFACTORY` / `ALTERATIONS_REQUIRED` (DAT-14).
- `recordEnvironment` marker and index on all 12 models (DAT-07).
- The `PaymentAttempt` model already applied in migration `20261122120000` — its current shape is authoritative; the conflicting `ABANDONED` / `failure_code` shape in the Task 04 document is **not** adopted.
- `Session` as drafted in the pending migration `20261127120000` — no `revokedAt` until database sessions are adopted.

## 4. Proposed target structure

Grouping is logical/domain-based; the Prisma schema file keeps the same seven labelled sections and the `FIND A TABLE` index already in place.

### 4.1 Identity & access

| Model | Proposed change |
|---|---|
| `Business` | Keep. Make `phone` and `address` nullable (PRD §8.5). Keep `email` required (FAQ-12 needs shop contact details). Add the PRD relations to `User`, `Order`, `BusinessDocument`, `KnowledgeChunk`. One row only. |
| `User` | Keep. Add `businessId` (FK → `Business`, required) + index. Keep both `emailVerified` and `emailVerifiedAt` for now — the app reads both; consolidation is a later, separate change. Add `@@index([businessId])`. |
| `Session` | Keep the pending model unchanged. It stays inert while sessions are JWT. |

### 4.2 Measurements

| Model | Proposed change |
|---|---|
| `Measurement` | Keep the seven typed centimetre columns (`chest`, `waist`, `hip`, `shoulder`, `sleeve`, `inseam`, `length`) — they match the working assumption in PRD Q7 and FR-10, and converting to a generic JSON `values` field would discard column-level meaning. Add composite index `[userId, recordEnvironment]`. No cascade from `User`. |

### 4.3 Orders & fulfilment

| Model | Proposed change |
|---|---|
| `Order` | Add `businessId` (FK → `Business`) and index `[businessId, status, recordEnvironment]`. Add optional `measurementId` (FK → `Measurement`, `ON DELETE SET NULL`) per PRD §8.5. Add `currency String @default("NGN")`. Rename `quotedTotal` → `quotedAmount`, `proposedCompletionDate` → `proposedCompletionAt` to match PRD names. Keep `measurementsSnapshot`. |
| `OrderStatusAudit` → `OrderStatusEvent` | Rename the model/table to the PRD name. Rename columns `previousStatus` → `fromStatus`, `newStatus` → `toStatus`. Keep `actorType`, `actorId`, `note`. Add the DAT-11 CHECK constraint: `(actorType = 'USER' AND actorId IS NOT NULL) OR (actorType = 'SYSTEM' AND actorId IS NULL)`. Rename its indexes/constraint names to match. |
| `Fitting` | Rename columns to PRD names: `fittingDate` → `fittedAt`, `tailorNotes` → `notes`. Add index `[recordedById]`. No mutation of existing fittings. |

### 4.4 Payments

| Model | Proposed change |
|---|---|
| `Payment` | Add `currency String @default("NGN")`, `provider String @default("paystack")`, optional `providerTxId`. Rename `paystackReference` → `providerReference` (unique). Add composite index `[orderId, type, status]`. Optional DB safety net: partial unique index on `[orderId, type]` where `status = 'SUCCESSFUL'` (PAY-10). |
| `PaymentAttempt` | Keep as implemented: `paymentId`, `status PENDING/SUCCESSFUL/FAILED`, `amount`, `currency`, `provider`, `providerReference`, `errorCode`, `errorMessage`, `metadata`. Do **not** adopt the Task 04 `ABANDONED` redesign. |

### 4.5 FAQ assistant & vectors

| Model | Proposed change |
|---|---|
| `FAQDocument` → `BusinessDocument` | Rename to PRD name. Add `businessId` (FK → `Business`) + index `[businessId, status, recordEnvironment]`. |
| `FAQChunk` → `KnowledgeChunk` | Rename to PRD name. Add `businessId` (FK → `Business`) + `chunkIndex Int`. Add `@@unique([documentId, chunkIndex])` and index `[businessId]`. Keep `heading` for readable citations. |
| `DocumentStatus` → `DocStatus` | Rename enum to PRD name; values unchanged. |
| `AssistantMessage` | Add per PRD §8.5 and FAQ-20: `id`, `userId` (FK → `User`), `question`, `answer`, `sourceChunkIds String[]`, `grounded Boolean`, `createdAt`, `recordEnvironment`; index `[userId, createdAt]`. |
| Vector layer | **Deferred.** Needs `CREATE EXTENSION vector`, an `embedding` column, and an HNSW cosine index. Blocked until you choose the Gemini dimension (768 / 1536 / 3072 — PRD Q13 is OPEN). |
| `AssistantSource` join table | Not added. It appears in the Task 04 document but not in PRD §8.5, and no data-model rule covers it. PRD uses `sourceChunkIds` instead. |

### 4.6 Compliance

| Model | Proposed change |
|---|---|
| `ContactAudit` | Keep. Add composite index `[customerId, recordEnvironment]`. Append-only. |

### 4.7 Cross-cutting rules

- Every new table carries `recordEnvironment @default(LIVE)` and its index (DAT-07).
- Business scoping is placed on the PRD's root aggregates (`User`, `Order`, `BusinessDocument`, `KnowledgeChunk`); child records inherit the business through their FK path. This matches PRD §8.5 and avoids denormalising inconsistent copies. Every new query must filter by the business ID from the session, never from the request body.
- Duplicate indexes `User_email_idx` and `Payment_paystackReference_idx` (to become `providerReference_idx`) can be dropped: the unique indexes already serve lookups. Optional cleanup.
- No cascade from `User` to financial/audit records. `Session` cascade is retained.
- No new enum values or order statuses. PRD open questions stay open.

## 5. Migration sequence (all owner-run; none applied yet)

| # | Name | Contents | Risk |
|---|---|---|---|
| M1 | `align_core_names_and_business_scope` | Rename `OrderStatusAudit`→`OrderStatusEvent`, `FAQDocument`→`BusinessDocument`, `FAQChunk`→`KnowledgeChunk`, enum `DocumentStatus`→`DocStatus`; rename affected columns, indexes and constraints; add `businessId` to `User`, `Order`, `BusinessDocument`, `KnowledgeChunk`; backfill the single `Business` row; set NOT NULL; add FKs and indexes. | **RISKY** (DB-06): backfill and new constraints. Backup/rollback confirmation required. |
| M2 | `align_order_and_payment_fields` | Order column renames + `measurementId`, `currency`; Fitting column renames; Payment `currency`, `provider`, `providerTxId`, `providerReference` rename, composite index; DAT-11 CHECK; optional positive-quote CHECK; optional successful-payment partial unique index. | NOT RISKY if existing rows pass the CHECKs — owner must verify first. |
| M3 | `add_faq_structure` | `chunkIndex` + unique on KnowledgeChunk; `AssistantMessage` table; indexes; relationship updates. | NOT RISKY: additive plus rename of already-renamed tables. |
| M4 | `add_vector_search` | `CREATE EXTENSION IF NOT EXISTS vector`, `embedding vector(dim)`, HNSW cosine index. | BLOCKED until Q13 dimension is chosen. Existing documents would need re-embedding if any exist. |
| M5 | `drop_duplicate_indexes` | Drop the two redundant indexes. | NOT RISKY. Optional. |

Each migration will get its own hand-written SQL plus a `RUN_SHEET.md` with owner-run commands, target environment, expected result, and a read-only check, following the existing migration pattern. The pending `Session` migration already on disk is left untouched.

## 6. Data preservation and verification

- Renames use `ALTER TABLE ... RENAME TO`, `RENAME COLUMN`, and `RENAME CONSTRAINT` — no `DROP`/recreate, so rows are preserved.
- `businessId` is added as nullable first, backfilled from the single `Business` row, then set NOT NULL. No row is deleted or rewritten.
- Before M1 the owner must confirm which `Business` row exists, or approve values for a single inserted row (`name`, `phone`, `email`, `address`).
- Before M2 the owner runs read-only checks for invalid audit actor rows and invalid quote values.
- Before M1 (RISKY) the owner confirms a backup/rollback strategy as required by DB-06.

## 7. Application-code changes required after approval

1. `src/lib/auth.ts` and `src/types/next-auth.d.ts` — carry `businessId` in JWT and session so queries can filter by it.
2. `src/app/api/auth/register/route.ts` — set `businessId` on new users.
3. Future order/payment/FAQ/measurement code — use the renamed Prisma models/fields and filter by `businessId` + `recordEnvironment`; propagate `recordEnvironment` from the parent user.
4. A single-business bootstrap path — the app never creates a `Business` row today; the owner must create it or approve a migration placeholder.
5. No change to the JWT session strategy or `Session` usage is included; that is a separate security decision.

## 8. Decisions required from the owner before any SQL is written

1. Approve the PRD-aligned renames in M1–M3, or keep current model/field names and only add missing columns.
2. Provide or approve the single `Business` row values, and confirm the backup/rollback strategy for M1.
3. Choose the Gemini embedding model and output dimension (768 / 1536 / 3072) to unblock M4.
4. Decide whether to include the optional DB CHECKs and partial unique index in M2.
5. Decide whether to switch from JWT to database sessions; if yes, `Session` needs `revokedAt` and a separate migration.
6. Confirm that `AssistantMessage` should be created now while `AssistantSource` is excluded.
