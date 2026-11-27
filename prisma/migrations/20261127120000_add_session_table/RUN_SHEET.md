The agent does not run these commands. The owner runs them.

# Run sheet: Add Session table

Status: **PENDING OWNER RUN**. Do not mark as applied until the owner runs it.

## Change

Adds the `Session` table so the application can store database session records with a hashed token and an expiry, replacing nothing and altering no existing table.

## Classification

**NOT RISKY** under DB-06. The change is additive: a new empty table, one unique index, three indexes, and one foreign key. It rewrites no existing table, drops no object, and changes no constraint on existing data. No backup or rollback step is required for this classification.

Rules applied:

- DB-01 and DB-03: the change is version-controlled and keeps the database aligned with the Prisma model.
- DAT-07: `recordEnvironment` is present so test, preview, and live session rows stay distinguishable in the shared v1 database. The application must set the marker to match the owning user.
- DAT-13: the cascade applies to `Session` only, which is not one of the protected record types (`Order`, `Payment`, `OrderStatusEvent`, `Fitting`). Session rows are ephemeral credentials and must not outlive their user; no cascade is added to any financial or audit table.
- No rule in `data-model.md` covers non-vector indexes. `Session_userId_idx` follows the existing schema convention that every foreign key is indexed, `Session_expiresAt_idx` supports expiry sweeps, and `Session_recordEnvironment_idx` supports the DAT-07 test-data filter. Drop any of the three if you do not want it before running.

## Step 1 - Apply the migration

- Command the owner runs by hand:
  `npx prisma migrate deploy --schema prisma/schema.prisma`
  with the direct, unpooled connection string (`POSTGRES_URL_NON_POOLING`) set for the selected environment. Do not use a pooled runtime connection for migrations.
- Target environment: the environment selected under ENV-01 and ENV-02. All v1 environments share one PostgreSQL database, so use that environment's own configuration and do not mix test and production credentials.
- Expected result: Prisma reports `20261127120000_add_session_table` as applied with no SQL errors. No existing table is altered.
- Read-only check the owner runs after the command:
  `npx prisma migrate status --schema prisma/schema.prisma`
  Expected result: the new migration is listed as applied and no migration is reported as pending or modified.

### Alternative - run the SQL by hand

If you prefer to execute the SQL directly, run `migration.sql` against the same direct, unpooled connection, then record it so Prisma's history stays consistent:

`npx prisma migrate resolve --applied 20261127120000_add_session_table --schema prisma/schema.prisma`

Expected result: `migrate resolve` reports the migration as applied. Do not run both this and Step 1; pick one.

## Step 2 - Verify the created objects

- Command the owner runs by hand (read-only SQL in the selected environment's database console):

  ```sql
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'Session'
  ORDER BY ordinal_position;

  SELECT indexname FROM pg_indexes WHERE tablename = 'Session' ORDER BY indexname;

  SELECT constraint_name, delete_rule
  FROM information_schema.referential_constraints
  WHERE constraint_name = 'Session_userId_fkey';
  ```

- Target environment: the same environment as Step 1.
- Expected result: six columns — `id` (text, not null), `userId` (text, not null), `hashedToken` (text, not null), `expiresAt` (timestamp without time zone, not null), `createdAt` (timestamp, not null, default `CURRENT_TIMESTAMP`), `recordEnvironment` (user-defined enum, not null, default `LIVE`); the primary key plus four indexes (`Session_pkey`, `Session_hashedToken_key`, `Session_userId_idx`, `Session_expiresAt_idx`, `Session_recordEnvironment_idx`); and one foreign key with delete rule `CASCADE`.
- Read-only check: the three `SELECT` statements above are themselves the read-only check. No write SQL is used in this step.

## Step 3 - Regenerate the Prisma client

- Command the owner runs by hand:
  `npx prisma generate`
- Target environment: the local development machine. This command reads `prisma/schema.prisma` only and does not connect to the database.
- Expected result: `Generated Prisma Client` is reported, and `prisma.session` is available to application code.
- Read-only check the owner runs after the command:
  `npx prisma validate`
  Expected result: the schema is reported as valid.

## After the migration

The table stays empty until the application creates session rows. The app currently uses `session: { strategy: 'jwt' }` in `src/lib/auth.ts`, so nothing writes to `Session` yet; switching the session strategy is a separate, security-relevant change and is not part of this handoff.

## If you must undo

Only while the table is still empty, and only if you have not built features on it:

```sql
DROP TABLE "Session";
```

Then remove the migration folder from version control and run `npx prisma migrate resolve --rolled-back 20261127120000_add_session_table` so Prisma's history matches the database.
