The agent does not run these commands. The owner runs them.

# Run sheet: Add User verification code and expiry columns

Status: **PENDING OWNER RUN**. Do not mark as applied until the owner runs it.

## Change

Adds nullable `verificationCode` (`TEXT`) and `verificationExpires` (`TIMESTAMP(3)`) columns to the `User` table so the email verification flow can store and expire the six-digit code.

## Classification

**NOT RISKY** under DB-06. This is an additive change to nullable columns. It does not rewrite data, drop objects, or change constraints.

Rules applied:

- ACC-11 and ACC-12 in `.agents/rules/accounts-and-access.md`: email and password accounts must be verified, and the verification code must expire.
- DB-01 and DB-03 in `.agents/rules/database.md`: the change is version-controlled and keeps the database consistent with `prisma/schema.prisma`.

## Step 1 - Apply the migration

- Command the owner runs by hand:
  `npx prisma migrate deploy --schema prisma/schema.prisma`
  with the direct, unpooled connection string (`POSTGRES_URL_NON_POOLING`) set for the selected environment.
- Target environment: the environment whose database is missing the columns, checked against ENV-01 and ENV-02. Use that environment's own configuration only; do not mix test and production credentials.
- Expected result: Prisma reports `20261121120000_add_user_verification_code_and_expiry` as applied with no SQL errors. If `20261121000000_add_email_verification_fields` is also pending, Prisma applies it too; that migration adds the related `emailVerifiedAt` column that is also present in the schema.
- Read-only check the owner runs after the command:
  `npx prisma migrate status --schema prisma/schema.prisma`
  Expected result: the new migration is listed as applied and no migration is reported as pending or modified.

## Step 2 - Confirm the columns exist

- Command the owner runs by hand (read-only SQL in the selected environment's database console):
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User' AND column_name IN ('verificationCode', 'verificationExpires') ORDER BY column_name;`
- Target environment: the same environment used in Step 1, per ENV-01 and ENV-02.
- Expected result: two rows are returned. `verificationCode` has data type `text`, and `verificationExpires` has data type `timestamp without time zone`.
- Read-only check: the `SELECT` statement above is itself the read-only check. No write SQL is used in this step.

## Optional rollback

Not required for this NOT RISKY change. If the owner decides to reverse it, run the following only after confirming no verification flow depends on the columns:

`ALTER TABLE "User" DROP COLUMN IF EXISTS "verificationExpires", DROP COLUMN IF EXISTS "verificationCode";`

Rollback target: the same environment used in Step 1. Expected result: both columns are removed. Read-only check: rerun the Step 2 `SELECT`; it should return zero rows.
