The agent does not run these commands. The owner runs them.

# Run sheet: Add PaymentAttempt table

Status: **PENDING OWNER RUN**. Do not mark as applied until the owner runs it.

## Change

Adds the `PaymentAttemptStatus` enum (`PENDING`, `SUCCESSFUL`, `FAILED`) and the `PaymentAttempt` table, with five indexes and one foreign key to `Payment`. Records describe individual checkout and verification attempts so retries can be audited and reconciled without changing the parent payment.

## Classification

**NOT RISKY** under DB-06. The change is additive: a new enum, a new empty table, indexes, and a foreign key. It rewrites no existing table, drops no object, and changes no constraint on existing data. No backup or rollback step is required for this classification.

Rules applied:

- DB-01 and DB-03: the change is version-controlled and keeps the schema aligned with the Prisma model.
- DAT-02 and PAY-04: `amount` is an integer in kobo; `currency` defaults to NGN.
- DAT-07: `recordEnvironment` is present so test and live attempts remain distinguishable in the shared v1 database. The application must copy the marker from the parent `Payment`.
- DAT-13: the foreign key is `ON DELETE RESTRICT`, so payment records cannot cascade-delete attempt history.
- DAT-04 and FR-71: attempt records are append-only. Application code must insert new rows for retries and must never update or delete an existing attempt.

## Step 1 - Apply the migration

- Command the owner runs by hand:
  `npx prisma migrate deploy --schema prisma/schema.prisma`
  with the direct, unpooled connection string (`POSTGRES_URL_NON_POOLING`) set for the selected environment. Do not use a pooled runtime connection for migrations.
- Target environment: the environment selected under ENV-01 and ENV-02. All v1 environments share one PostgreSQL database, so use that environment's own configuration and do not mix test and production credentials.
- Expected result: Prisma reports `20261122120000_add_payment_attempt_table` as applied with no SQL errors. No existing table is altered.
- Read-only check the owner runs after the command:
  `npx prisma migrate status --schema prisma/schema.prisma`
  Expected result: the new migration is listed as applied and no migration is reported as pending or modified.

## Step 2 - Verify the created objects

- Command the owner runs by hand (read-only SQL in the selected environment's database console):

  ```sql
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'PaymentAttempt'
  ORDER BY ordinal_position;

  SELECT e.enumlabel
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE t.typname = 'PaymentAttemptStatus'
  ORDER BY e.enumsortorder;

  SELECT indexname FROM pg_indexes WHERE tablename = 'PaymentAttempt' ORDER BY indexname;

  SELECT constraint_name, delete_rule
  FROM information_schema.referential_constraints
  WHERE constraint_name = 'PaymentAttempt_paymentId_fkey';
  ```

- Target environment: the same environment as Step 1.
- Expected result: thirteen columns including `metadata` as `jsonb` and `recordEnvironment` as the `RecordEnvironment` enum; three enum labels; the primary key plus five named indexes (`PaymentAttempt_paymentId_idx`, `PaymentAttempt_status_idx`, `PaymentAttempt_createdAt_idx`, `PaymentAttempt_providerReference_idx`, `PaymentAttempt_recordEnvironment_idx`); and one foreign key with delete rule `NO ACTION` (Prisma's `RESTRICT`).
- Read-only check: the four `SELECT` statements above are themselves the read-only check. No write SQL is used in this step.

## After the migration

The client has already been regenerated locally for this schema change. Application code can create `PaymentAttempt` rows, but writing that code is outside this migration handoff. Do not record an attempt as a substitute for the verified `Payment` status transition required by FR-41.
