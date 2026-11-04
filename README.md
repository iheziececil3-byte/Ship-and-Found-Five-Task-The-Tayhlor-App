# Tayhlor

## 1. What this is

Tayhlor is a dedicated web application for an independent bespoke tailoring shop that manages customer measurement records, clothing orders, and two-stage payments—a 70% deposit before work begins and a 30% balance upon collection and fitting—so that customers and the tailor operate on verified, recorded information without continuous manual status inquiries.

The application serves two primary user roles with strictly segregated interfaces and permissions:
- **Customers**: Individuals who commission bespoke garments, maintain their personal measurement profiles, submit clothing orders, review quotes and proposed completion dates, pay required deposits and balances when unlocked, and track live order progress from submission to completion.
- **The Tailor (Shop Owner / Administrator)**: The craftsperson and business administrator who manages incoming orders, accepts or declines commissions with explicit pricing and completion timeframes, reviews customer measurements for active clients, logs garment fittings, tracks outstanding balances, and curates tailor-approved FAQ source documentation.

Tayhlor replaces scattered informal messaging channels, physical paper ledgers, and verbal agreements with a centralized, auditable system. Its guiding operational rule is verification: order progress, completion estimates, payment receipts, and business policies must reflect authoritative database records, never speculative promises or ungrounded responses.

---

## 2. Status

### Completed
- **Design System Implementation**: Integrated Material Design 3 design tokens in `src/styles/tokens.css` and mapped them to `tailwind.config.ts`, establishing semantic color roles (`primary`, `secondary`, `surface`, `outline-variant`), a 15-style typography scale using `Lora` and `Manrope`, and 3-tier elevation shadows (`soft`, `medium`, `hard`).
- **Application Shell & Layout**: Established Next.js 14 App Router layout (`src/app/layout.tsx`) with font optimization, client-side session hydration via `SessionProvider`, and responsive marketing landing page (`src/app/page.tsx`).
- **Authentication Infrastructure**: NextAuth v4 configuration (`src/lib/auth.ts`) utilizing JWT session strategy with a 7-day inactivity expiration (`ACC-08`), role augmentation (`CUSTOMER` and `TAILOR`), and Credentials provider integration.
- **Customer Registration Endpoint**: API route (`src/app/api/auth/register/route.ts`) enforcing server-side Zod validation (`src/lib/validations/auth.ts`), password hashing with 12 salt rounds via `bcryptjs`, duplicate email conflict handling (HTTP 409 and Prisma `P2002` error catching), and test-environment data labeling (`recordEnvironment`).
- **Authentication Interface**: Interactive Sign-In (`src/app/auth/signin/page.tsx`) and Sign-Up (`src/app/auth/signup/page.tsx`) pages equipped with active session detection, graceful degradation when optional OAuth credentials are omitted, and form error feedback.
- **Session-Aware Navigation**: Dynamic header navigation (`src/components/navigation/UserNav.tsx`) and hero callouts (`src/components/home/HeroActions.tsx`) displaying authenticated user identity, role badges, and functional client-side sign-out (`signOut({ callbackUrl: '/' })`).
- **Database Schema Foundation**: Comprehensive Prisma schema (`prisma/schema.prisma`) declaring 9 core models (`User`, `Business`, `Measurement`, `Order`, `OrderStatusAudit`, `Payment`, `Fitting`, `FAQDocument`, `FAQChunk`, `ContactAudit`) with integer kobo money representations and test data isolation tags.
- **Database Baseline Migration**: Version-controlled initial PostgreSQL migration (`prisma/migrations/20261102151000_init/migration.sql`) tracking table DDL, foreign key relationships, indexes, and enumeration types.
- **Route Authorization Middleware**: Edge-compatible middleware (`src/middleware.ts`) enforcing role-based access control, blocking non-tailors from `/tailor/*` routes with HTTP 403 Forbidden, and requiring active sessions for protected paths.

### Partially completed
- **Database Model Operationalization**: While the schema and baseline migration define all 9 domain models, only the `User` model is currently queried and mutated by live application code. The remaining 8 models (`Order`, `Measurement`, `Payment`, `Fitting`, etc.) do not yet have corresponding runtime API routes, server actions, or mutation pipelines.
- **Authentication Lifecycle**: Customer registration, password sign-in, and session termination are operational. However, Google OAuth account linking confirmation (FR-01), email password reset (FR-03), and mandatory email verification gates before ordering (FR-05) remain unbuilt.
- **Protected Route Middleware**: Route boundaries for `/customer/*` and `/tailor/*` are configured in `src/middleware.ts`, but the underlying destination pages under those route hierarchies are not yet implemented.

### Not started
- **Customer Measurement Management (FR-10, FR-11)**: Interfaces and endpoints for customers to create, update, and delete measurement profiles, as well as the creation of immutable measurement snapshots upon order submission.
- **Order Lifecycle & Workflow (FR-20 – FR-33)**: Order submission forms, tailor incoming queue, price quote and completion date entry on acceptance, decline with reason, and state transitions (`SUBMITTED` -> `ACCEPTED` -> `IN_PROGRESS` -> `READY_FOR_COLLECTION` -> `COMPLETED`).
- **Fitting Records (FR-33, PRD 8.4)**: Interface and server actions to record garment fitting appointments with `SATISFACTORY` or `ALTERATIONS_REQUIRED` outcomes.
- **Paystack Payment Processing (FR-40 – FR-46)**: Server-side 70% deposit and 30% balance calculations, Paystack checkout redirection, cryptographic webhook signature verification, server-to-server transaction verification, and manual refund logging.
- **Customer & Tailor Dashboards (FR-44, FR-50)**: Live order tracking views, payment history tables, and tailor contact detail management with audit logging (FR-34).
- **Transactional Email Dispatch (FR-51)**: Integration with the Resend API to dispatch automated notifications when orders are accepted, declined, paid, ready, or refunded.
- **AI FAQ Assistant (FR-60 – FR-64)**: Retrieval-Augmented Generation (RAG) assistant using Google Gemini embeddings and pgvector similarity search over tailor-approved documents, including strict decline responses and source document citations.
- **Data Privacy & Compliance Controls (FR-72, FR-73)**: Customer data export mechanisms, account deletion workflows under category-based retention policies, and formal privacy notice disclosures.
- **Automated Test Suite (SEC-12, FR-04)**: Automated unit, integration, and end-to-end test suites covering authentication, role permissions, and record ownership.

---

## 3. The stack, with reasons

| Technology | Role in Project | Selection Rationale | Usage Status |
| :--- | :--- | :--- | :--- |
| **Next.js 14 (App Router)** | Full-Stack Application Framework | Selected as the core locked framework per PRD Section 1. Provides a unified React Server Component model, built-in API route handlers, layout nesting, and edge middleware without managing a detached backend. | Operational in application shell, auth pages, and API routes. |
| **TypeScript 5** | Static Type System | Enforces strict compile-time type safety across database models, API payloads, validation schemas, and UI components. Eliminates common runtime type errors. | Operational throughout `src/` and configuration files. |
| **Prisma ORM 5.21** | Data Modeling & Query Layer | Locked per PRD Section 1 & 8.2. Generates deterministic TypeScript database clients, manages version-controlled migration files, and provides type-safe SQL query generation. | Operational; schema and migration defined; `User` model actively queried. |
| **PostgreSQL** | Relational Database | Selected per PRD Q12 and `database.md` (provisioned via Vercel Postgres in production, local instance in development). Provides ACID transaction guarantees for two-stage payments and supports the `pgvector` extension for future RAG document search. | Operational locally on port 5433; baseline schema migrated. |
| **Auth.js / NextAuth 4.24** | Authentication & Session Management | Adopted working assumption per PRD Q6 and `accounts-and-access.md`. Manages signed JWT session cookies, credential authorization, and middleware token validation without external vendor lock-in. | Operational for email/password credentials and session state. |
| **Tailwind CSS 3.4** | Utility-First CSS Framework | Implements the Task 1 Design System. Uses custom CSS custom property abstractions to deliver Material Design 3 semantic color tokens, elevation shadows, and responsive layouts. | Operational across all frontend components. |
| **Zod 3.23** | Schema Validation | Enforces strict server-side boundary validation (SEC-07) for incoming registration and sign-in payloads, preventing injection and malformed inputs. | Operational in auth validation routes. |
| **bcryptjs 2.4** | Password Hashing | Provides cryptographic salting and hashing (12 rounds) for customer passwords prior to database storage, preventing plaintext credential exposure. | Operational in `src/lib/passwords.ts` and registration route. |
| **Paystack (Planned)** | Payment Gateway | Designated in PRD Section 1 & `payments.md` as the exclusive payment provider for NGN transactions (deposit and balance). Deferred until payment milestone. | Not installed or integrated; configuration placeholders documented. |
| **Resend (Planned)** | Transactional Email | Designated in PRD Section 1 & `requirements.md` for transactional customer notifications (order status changes, payment confirmations). | Not installed or integrated; configuration placeholders documented. |
| **Google Gemini API (Planned)** | Vector Embeddings & RAG | Designated in PRD Section 7 & `faq-assistant.md` for document chunk embedding and grounded question answering against tailor-approved business documents. | Not installed or integrated; configuration placeholders documented. |

---

## 4. Getting started

These instructions guide a developer starting from a fresh clone on a clean machine to a running local instance.

### Prerequisites
- **Node.js**: Version `18.17.0` or higher (Node 20.x LTS recommended).
- **npm**: Version `9.x` or higher (shipped with Node.js).
- **PostgreSQL**: Version `15.x`, `16.x`, or `17.x` installed and running locally, or access to a cloud PostgreSQL instance (e.g., Vercel Postgres, Neon, or Supabase).
- **Git**: Installed and configured.

### 1. Clone the Repository
```bash
git clone https://github.com/iheziececil3-byte/Ship-and-Found-Five-Task-The-Tayhlor-App.git
cd Ship-and-Found-Five-Task-The-Tayhlor-App
```

### 2. Install Project Dependencies
Install the locked dependencies using npm:
```bash
npm install
```

### 3. Configure Local Environment Variables
Create a local `.env` file by copying the template:
```bash
cp .env.example .env
```
Open `.env` in an editor and update the required values for your local environment:
- **`POSTGRES_PRISMA_URL`**: Set your PostgreSQL connection string (e.g., `postgresql://postgres:yourpassword@localhost:5432/tayhlor?schema=public`).
  - *Note for standard local PostgreSQL*: Ensure `pgbouncer=true` is omitted from your local URL if you are connecting directly to PostgreSQL without a PgBouncer proxy.
- **`POSTGRES_URL_NON_POOLING`**: For local development, set this to the same connection string as `POSTGRES_PRISMA_URL`.
- **`NEXTAUTH_SECRET`**: Generate a secure random string (e.g., via `openssl rand -base64 32`) and assign it here.
- **`NEXTAUTH_URL`**: Keep as `http://localhost:3000`.
- **`RECORD_ENVIRONMENT`**: Keep as `"TEST"` for local development.

### 4. Prepare the Database
Ensure your PostgreSQL instance has a database matching your connection string (for example, named `tayhlor`). If the database does not exist, create it:
```bash
# Using PostgreSQL command-line client
createdb -U postgres tayhlor
```
Generate the Prisma Client types:
```bash
npx prisma generate
```
Apply the baseline database migration:
```bash
npx prisma migrate deploy
```

### 5. Start the Development Server
```bash
npm run dev
```

### 6. Verify the Application
1. Open your browser and navigate to `http://localhost:3000`.
2. Verify that the Tayhlor marketing landing page renders with the brand heading, typography, and action buttons.
3. Click **"Get Started"** or visit `http://localhost:3000/auth/signup`.
4. Register a test customer account with a name, email, phone number, and password (minimum 8 characters).
5. Upon successful creation, you are automatically signed in and redirected to `/`.
6. Confirm that the header now displays your name, a `"CUSTOMER"` badge, and a **"Sign Out"** button.
7. (Optional) In a separate terminal, open Prisma Studio to view the stored database record:
   ```bash
   npx prisma studio
   ```
   Open `http://localhost:5555` and inspect the `User` table to verify row persistence.

### Common Troubleshooting
- **Database Connection Refused (`ECONNREFUSED`)**: Verify that PostgreSQL is actively running on the configured host and port, and check credentials in `.env`.
- **Unique Constraint Violation (`P2002`)**: Registration fails if an account with that email already exists. Use a unique email or navigate to `/auth/signin`.
- **Missing Secret Warning**: If NextAuth logs a warning about missing secrets, confirm that `NEXTAUTH_SECRET` is populated in `.env` and restart the development server.

---

## 5. Environment variables

The table below lists all environment variables defined across the codebase, Prisma configuration, and `.env.example`.

| Variable Name | Purpose | Required | Where or Why Used |
| :--- | :--- | :--- | :--- |
| `POSTGRES_PRISMA_URL` | Pooled connection string for application runtime database queries | **Required** | Referenced in `prisma/schema.prisma` (`url = env(...)`) for all runtime Prisma Client queries. |
| `POSTGRES_URL_NON_POOLING` | Direct unpooled connection string for migrations and CLI operations | **Required** | Referenced in `prisma/schema.prisma` (`directUrl = env(...)`) for Prisma CLI migrations. |
| `POSTGRES_URL` | Generic pooled runtime connection string for Vercel Postgres hosting | Optional in local dev | Documented in `env.md` for production connection pooling. |
| `POSTGRES_USER` | Database username component | Optional | Provided for reference in Vercel Postgres connection breakdowns. |
| `POSTGRES_HOST` | Database host component | Optional | Provided for reference in Vercel Postgres connection breakdowns. |
| `POSTGRES_PASSWORD` | Database password component | Optional | Provided for reference in Vercel Postgres connection breakdowns. |
| `POSTGRES_DATABASE` | Database name component | Optional | Provided for reference in Vercel Postgres connection breakdowns. |
| `RECORD_ENVIRONMENT` | Marker distinguishing `LIVE`, `TEST`, and `PREVIEW` records | Optional (defaults to `LIVE`) | Read in `src/app/api/auth/register/route.ts` to tag new customer accounts for test isolation. |
| `NEXTAUTH_URL` | Canonical base URL for NextAuth callbacks and redirects | **Required** (in production) | Used by NextAuth to construct absolute callback and redirection URLs. |
| `NEXTAUTH_SECRET` | Cryptographic secret used to encrypt and hash JWT session tokens | **Required** | Read in `src/lib/auth.ts` to secure user session cookies. |
| `GOOGLE_CLIENT_ID` | Client ID for Google OAuth authentication | Optional | Read in `src/lib/auth.ts` to conditionally activate the Google sign-in provider. |
| `GOOGLE_CLIENT_SECRET` | Client Secret for Google OAuth authentication | Optional | Read in `src/lib/auth.ts` in conjunction with `GOOGLE_CLIENT_ID`. |
| `PAYSTACK_SECRET_KEY` | Paystack secret key for transaction verification and refunds | Planned | Specified in `payments.md` and `.env.example` for server-side Paystack API calls. |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key for client-side checkout initiation | Planned | Specified in `payments.md` and `.env.example` for Paystack inline checkout scripts. |
| `PAYSTACK_WEBHOOK_SECRET` | Secret hash to cryptographically verify incoming Paystack webhooks | Planned | Specified in `payments.md` and `.env.example` to prevent forged payment events. |
| `RESEND_API_KEY` | API authentication key for Resend email dispatch | Planned | Specified in `requirements.md` and `.env.example` for transactional status emails. |
| `RESEND_FROM_EMAIL` | Verified sending address for outgoing customer emails | Planned | Specified in `requirements.md` and `.env.example`; requires domain verification. |
| `GEMINI_API_KEY` | Google Gemini API key for document embeddings and FAQ answers | Planned | Specified in `faq-assistant.md` and `.env.example` for AI RAG pipeline execution. |

*Security note: In accordance with `ENV-03` and `SEC-06`, actual secrets, credentials, and API keys are never committed to version control and must remain confined to local or deployment secret stores.*

---

## 6. What this deliberately does not do

The following functional boundaries are intentionally excluded from the Tayhlor application scope based on PRD Section 5.2 and architectural decisions:

- **Multi-Tenancy and Multi-Shop SaaS**: Tayhlor is architected specifically for one tailoring business owned and managed by the tailor (`PRD 5.1`, `PRD 5.2`). It deliberately excludes tenant switching, multi-shop databases, or SaaS organization management.
- **Marketplace or Tailor Discovery**: The application is not a directory or aggregator for discovering external tailors. It is a single-business management portal (`PRD 5.2`).
- **Inventory and Raw Materials Management**: The app deliberately does not track fabric rolls, thread stock, buttons, zippers, or workshop equipment inventory (`PRD 5.2`).
- **Accounting, Payroll, and Tax Operations**: Business bookkeeping, staff wage calculation, and statutory tax filing are excluded from the application scope (`PRD 5.2`).
- **Native Mobile Applications**: Tayhlor is built strictly as a responsive web application and deliberately avoids native iOS or Android codebases (`PRD 5.2`, `REQ-04`).
- **AI-Generated Pricing Quotes**: The application never generates, estimates, or suggests pricing. Every quoted total and proposed completion date must be explicitly entered by the tailor upon order acceptance (`PRD 5.2`, `FR-31`).
- **Real-Time Instant Messaging**: Synchronous chat channels are omitted. Status communication occurs through dashboard tracking and transactional email updates (`PRD 5.2`, `FR-50`).
- **Automated Refund Processing**: Payment refunds are not triggered automatically by software routines. The tailor processes refunds manually through the Paystack dashboard, then records the refund state in Tayhlor (`PRD 5.2`, `FR-46`).
- **Secondary Payment Providers**: Integration with secondary payment platforms (e.g., Flutterwave) is excluded for v1. Paystack is the single supported provider (`PRD 5.2`, `payments.md`).
- **Garment Reference Image Uploads**: Uploading style images, sketches, or fabric photographs is deferred to future versions (`PRD 5.2`, `REQ-02`).
- **Courier and Shipping Delivery**: Garment collection is conducted physically at the shop for fitting and satisfactory inspection. Shipping and courier dispatch workflows are excluded (`PRD 5.2`).

---

## 7. Known defects

The following known defects and technical debt items were identified during the repository audit:

1. **Unimplemented Protected Navigation Routes Produce HTTP 404**
   - **Location**: [`src/components/home/HeroActions.tsx`](file:///c:/Users/CECIL/Desktop/Tayhlor/src/components/home/HeroActions.tsx#L23-L33)
   - **Description**: When a customer is signed in, the hero actions component presents navigation links to `/customer/orders` and `/customer/measurements`. Because neither page currently exists in `src/app/customer/`, clicking either link results in an unhandled Next.js 404 Not Found error.
   - **Impact**: Authenticated users encounter broken links when attempting to access orders or measurements from the home page.
   - **Consequence if Unresolved**: Users cannot navigate past the home screen into order or measurement workflows.
   - **Status**: Verified.

2. **NextAuth `newUser` Configuration Targets a Non-Existent Route**
   - **Location**: [`src/lib/auth.ts`](file:///c:/Users/CECIL/Desktop/Tayhlor/src/lib/auth.ts#L16)
   - **Description**: The NextAuth configuration declares `pages.newUser = '/customer/dashboard'`, but no dashboard page exists at `src/app/customer/dashboard/page.tsx`.
   - **Impact**: If NextAuth routes a newly registered account to the designated new user path, the browser lands on an HTTP 404 page.
   - **Consequence if Unresolved**: Disrupts the post-registration redirection experience for new users.
   - **Status**: Verified.

3. **Password Hashing Implementation Discrepancy with Security Rules**
   - **Location**: [`src/lib/passwords.ts`](file:///c:/Users/CECIL/Desktop/Tayhlor/src/lib/passwords.ts#L1-L11) vs [`.agents/rules/security.md`](file:///c:/Users/CECIL/Desktop/Tayhlor/.agents/rules/security.md) (SEC-10)
   - **Description**: Rule `SEC-10` specifies: *"Password hashing MUST use Argon2id with a maintained implementation. Each password MUST receive a unique salt. PROPOSED."* The current application code implements `bcryptjs` with 12 salt rounds.
   - **Impact**: While `bcryptjs` provides industry-standard hashing, it deviates from the proposed project security rule specifying Argon2id.
   - **Consequence if Unresolved**: Schema or security audits may flag an architectural divergence between rule definitions and implementation code.
   - **Status**: Verified.

4. **PgBouncer Parameter Incompatibility in Local PostgreSQL Environments**
   - **Location**: [`prisma/schema.prisma`](file:///c:/Users/CECIL/Desktop/Tayhlor/prisma/schema.prisma#L10) and [`.env.example`](file:///c:/Users/CECIL/Desktop/Tayhlor/.env.example#L11)
   - **Description**: The Prisma schema expects `POSTGRES_PRISMA_URL` to point to a pooled connection string. When `.env.example` documents `&pgbouncer=true`, developers copying this pattern into a direct local PostgreSQL setup without an active PgBouncer daemon will encounter handshake failures.
   - **Impact**: New developers attempting local setup without removing the query parameter experience database connection errors.
   - **Consequence if Unresolved**: Increases setup friction for new contributors not using managed cloud connection poolers.
   - **Status**: Verified.

5. **Absence of an Automated Test Framework**
   - **Location**: [`package.json`](file:///c:/Users/CECIL/Desktop/Tayhlor/package.json)
   - **Description**: `package.json` contains no automated test runner (such as Jest or Vitest) and no test script, despite project security rule `SEC-12` and PRD requirement `FR-04` mandating automated test coverage for authentication, role permissions, and route boundaries.
   - **Impact**: Route permissions, boundary checks, and API validation must be verified manually.
   - **Consequence if Unresolved**: Elevates the risk of regression in access control and authorization logic.
   - **Status**: Verified.
