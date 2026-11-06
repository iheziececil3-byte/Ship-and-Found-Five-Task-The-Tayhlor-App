# README Test

## 1. Purpose of the README Test

The purpose of the README test is to verify that a developer with no prior exposure to the Tayhlor codebase can read `README.md`, accurately comprehend the project's architecture, verify the true implementation status of all subsystems, and follow the setup instructions to run the application locally. It also serves as an audit mechanism to ensure all technical claims in the documentation remain strictly faithful to the actual source code and runtime behavior.

---

## 2. Reviewer Examination and Code Execution

The `README.md` documentation was shared with an external reviewer who had not previously worked on the project. The reviewer read through the complete documentation and subsequently ran the application code.

**Current Test Status:**
- Documentation review: **Completed**.
- Code execution: **Completed**.
- Independent end-to-end setup test from scratch: **Unverified (Pending)**.

---

## 3. Areas Identified for Clarification

The reviewer identified two specific sections where documentation needed clearer technical refinement:

### A. Authentication Infrastructure
- **Reviewer Feedback**: The reviewer requested clearer explanations of the NextAuth.js v4 configuration in `src/lib/auth.ts`, specifically highlighting the JWT session strategy, the seven-day inactivity expiration policy (`ACC-08`), role augmentation (`CUSTOMER` and `TAILOR`), and Credentials provider integration.

### B. Database Model Operationalization
- **Reviewer Feedback**: The reviewer requested clarification that although the schema and baseline migration define the domain models, only the `User` model is currently queried and mutated by live application code. The remaining models, including `Order`, `Measurement`, `Payment`, and `Fitting`, do not yet have corresponding runtime API routes, server actions, or mutation pipelines.
- **Implementation Discrepancy Note**: During source inspection to incorporate this feedback, the codebase was audited against `prisma/schema.prisma` and the baseline migration (`prisma/migrations/20261102151000_init/migration.sql`). While the reviewer referred to "nine domain models" and "remaining eight models", the schema and migration actually declare **10 models** in total:
  1. `User`
  2. `Business`
  3. `Measurement`
  4. `Order`
  5. `OrderStatusAudit`
  6. `Payment`
  7. `Fitting`
  8. `FAQDocument`
  9. `FAQChunk`
  10. `ContactAudit`

  Runtime code inspection confirmed that only `User` is queried or mutated at runtime. Consequently, there are **9 remaining unqueried models** rather than 8. The documentation was corrected to state the verified count of 10 total models and 9 unqueried models rather than repeating the reviewer's unverified count.

---

## 4. Documentation Changes Made in Response to Feedback

In response to the reviewer's feedback, `README.md` was updated as follows:

1. **Authentication Infrastructure (`README.md` Section 2: Completed)**:
   - Explicitly documented that NextAuth.js v4 configuration is centralized at `src/lib/auth.ts` (exported as `authOptions` and wired to `src/app/api/auth/[...nextauth]/route.ts`).
   - Specified that the application uses a stateless JWT session strategy (`strategy: 'jwt'`).
   - Detailed the 7-day session inactivity expiration policy (`maxAge: 7 * 24 * 60 * 60`, or 604,800 seconds) in compliance with requirement `ACC-08`.
   - Documented role augmentation supporting both `CUSTOMER` and `TAILOR` roles via TypeScript module augmentation in `src/types/next-auth.d.ts` and callback population in `jwt` and `session` hooks.
   - Confirmed that authentication operates through the Credentials provider with server-side Zod validation against `src/lib/validations/auth.ts` and bcrypt password hash verification against the database `User` record, returning generic errors (`ACC-07`) on failure.

2. **Database Model Operationalization (`README.md` Section 2: Partially Completed)**:
   - Renamed the section entry to **"Database Model Operationalization vs. Schema Definitions"** to establish an explicit boundary between schema structure and working application logic.
   - Documented the verified count of 10 models declared in `prisma/schema.prisma` and `prisma/migrations/20261102151000_init/migration.sql`.
   - Stated unequivocally that only the `User` model is queried or mutated by live application code (during customer registration in `src/app/api/auth/register/route.ts` and credential verification in `src/lib/auth.ts`).
   - Clarified that the remaining 9 models (`Order`, `Measurement`, `Payment`, `Fitting`, `Business`, `FAQDocument`, `FAQChunk`, `OrderStatusAudit`, `ContactAudit`) exist solely as structural database definitions with no active runtime API routes, server actions, or mutation pipelines, and must not be described as operational business workflows or working features.

---

## 5. Setup Verification Status & Testing Distinction

An important distinction is maintained regarding the scope of testing performed:

- **What occurred**: The external reviewer read the documentation and subsequently executed the application code.
- **What did not occur**: The reviewer did not execute a documented, clean-slate, end-to-end setup test from scratch on an isolated machine (i.e. cloning the repository afresh, preparing local environment variables, running package installation, provisioning PostgreSQL, and applying database migrations from the CLI).
- **Result**: The independent end-to-end setup walkthrough remains **unverified**.

To maintain technical integrity and transparency:
- No installation metrics, environment setup times, or database provisioning timings are claimed.
- No unobserved errors, blockers, or hypothetical setup results are recorded.
- A full independent setup walkthrough on a separate clean environment remains an outstanding testing objective for future release validation.
