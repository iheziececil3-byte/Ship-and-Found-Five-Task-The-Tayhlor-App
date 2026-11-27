The agent does not run these commands. The owner runs them.

# Run sheet: Align columns and add AssistantMessage

Status: **PENDING OWNER RUN**. Do not mark as applied until the owner runs it.

## Change

Adds the missing fields and indexes from the schema audit: `Order.currency` and `Order.measurementId`, `Payment.currency`, `Payment.provider` and `Payment.providerTxId`, `FAQChunk.chunkIndex`, the `AssistantMessage` log table, seven supporting indexes, two foreign keys, and the DAT-11 actor CHECK constraint on `OrderStatusAudit`. No table, column, or constraint is dropped or renamed.

## Classification

**NOT RISKY** under DB-06. Every column is nullable or has a safe default; the new table is empty; indexes, foreign keys, and one CHECK constraint are added. No existing row is rewritten and no object is dropped. A backup is not required for this classification, though the owner may take one.

**Mandatory precondition:** the DAT-11 precheck in Step 0 must return zero. If it returns any row, stop and resolve the invalid audit records before running this migration.

Rules applied:

- DAT-11: the CHECK enforces `USER` events with a non-null `actorId` and `SYSTEM` events with a null `actorId`, without dummy system users.
- DAT-07: `AssistantMessage` carries `recordEnvironment` with a `LIVE` default and an index.
- DAT-13: `AssistantMessage.userId` uses `RESTRICT`, so account deletion cannot cascade to the log.
- PAY-01, PAY-04: `Payment.provider` defaults to `paystack` and `currency` to `NGN`; money remains in integer kobo.
- PAY-18, FAQ-20: the `AssistantMessage` table provides the required log of questions, answers, source chunk IDs, and the grounded flag.
- PRD §8.5: `Order.measurementId`, `Order.currency`, `Payment.currency`, `Payment.provider`, `Payment.providerTxId`, and `FAQChunk.chunkIndex` are added. `chunkIndex` is deliberately nullable so existing rows survive; making it required requires a later migration after a backfill.
- DAT-14, DAT-05, DAT-07, FAQ-14: supporting indexes on `Fitting.recordedById`, `ContactAudit.customerId`, and the unique `[documentId, chunkIndex]` pair.

Intentionally excluded by owner decision: model and column renames, `businessId` scoping, the vector layer, and duplicate-index cleanup. The pending `Session` migration (`20261127120000`) remains separate.

## Step 0 - Mandatory read-only precheck

- Command the owner runs by hand (read-only SQL in the selected environment's database console):

  ```sql
  SELECT COUNT(*) AS invalid_actor_rows
  FROM "OrderStatusAudit"
  WHERE ("actorType" = 'USER' AND "actorId" IS NULL)
     OR ("actorType" = 'SYSTEM' AND "actorId" IS NOT NULL);
  ```

- Target environment: the environment selected under ENV-01 and ENV-02. All v1 environments share one PostgreSQL database, so use that environment's own configuration and do not mix test and production credentials.
- Expected result: `invalid_actor_rows = 0`. If it is greater than zero, stop; do not apply this migration.
- Read-only check: the `SELECT` above is itself the check. No write SQL is used in this step.

## Step 1 - Apply the migration

- Command the owner runs by hand:
  `npx prisma migrate deploy --schema prisma/schema.prisma`
  with the direct, unpooled connection string (`POSTGRES_URL_NON_POOLING`) set for the selected environment. Do not use a pooled runtime connection for migrations.
- Target environment: the same environment as Step 0. This applies all pending migrations in order, including `20261127120000_add_session_table` if it has not yet been applied.
- Expected result: Prisma reports `20261127130000_align_columns_add_assistant_message` as applied with no SQL errors. No existing table is dropped or recreated.
- Read-only check the owner runs after the command:
  `npx prisma migrate status --schema prisma/schema.prisma`
  Expected result: both `20261127120000_add_session_table` and `20261127130000_align_columns_add_assistant_message` are listed as applied, and no migration is reported as pending or modified.

### Alternative - run the SQL by hand

If you prefer to execute the SQL directly, run `migration.sql` against the same direct, unpooled connection, then record it so Prisma's history stays consistent:

`npx prisma migrate resolve --applied 20261127130000_align_columns_add_assistant_message --schema prisma/schema.prisma`

Expected result: `migrate resolve` reports the migration as applied. Do not run both this and Step 1; pick one.

## Step 2 - Verify the created objects

- Command the owner runs by hand (read-only SQL in the selected environment's database console):

  ```sql
  SELECT table_name, column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE (table_name = 'Order' AND column_name IN ('currency', 'measurementId'))
     OR (table_name = 'Payment' AND column_name IN ('currency', 'provider', 'providerTxId'))
     OR (table_name = 'FAQChunk' AND column_name = 'chunkIndex')
     OR table_name = 'AssistantMessage'
  ORDER BY table_name, ordinal_position;

  SELECT indexname FROM pg_indexes
  WHERE tablename IN ('AssistantMessage', 'Measurement', 'Fitting', 'Payment', 'FAQChunk', 'ContactAudit')
    AND indexname IN (
      'AssistantMessage_userId_createdAt_idx',
      'AssistantMessage_createdAt_idx',
      'AssistantMessage_recordEnvironment_idx',
      'Measurement_userId_recordEnvironment_idx',
      'Fitting_recordedById_idx',
      'Payment_orderId_type_status_idx',
      'FAQChunk_documentId_chunkIndex_key',
      'ContactAudit_customerId_recordEnvironment_idx'
    )
  ORDER BY indexname;

  SELECT conname, pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conname IN (
    'Order_measurementId_fkey',
    'AssistantMessage_userId_fkey',
    'OrderStatusAudit_actor_check'
  )
  ORDER BY conname;
  ```

- Target environment: the same environment as Step 1.
- Expected result: the new columns exist with `NGN` and `paystack` defaults; `chunkIndex` is nullable; `AssistantMessage` has eight columns including `sourceChunkIds` as `ARRAY`; all eight named indexes exist; `Order_measurementId_fkey` uses `SET NULL` on delete, `AssistantMessage_userId_fkey` uses `NO ACTION` (Prisma's `RESTRICT`), and `OrderStatusAudit_actor_check` contains the DAT-11 expression.
- Read-only check: the three `SELECT` statements above are themselves the read-only check. No write SQL is used in this step.

## Step 3 - Regenerate the Prisma client

- Command the owner runs by hand:
  `npx prisma generate`
- Target environment: the local development machine. This command reads `prisma/schema.prisma` only and does not connect to the database.
- Expected result: `Generated Prisma Client` is reported, and `prisma.assistantMessage` plus the new fields are available to application code.
- Read-only check the owner runs after the command:
  `npx prisma validate`
  Expected result: the schema is reported as valid.

## After the migration

The `AssistantMessage` table stays empty until the assistant is implemented. The SQL-only CHECK constraint `OrderStatusAudit_actor_check` is not visible as a Prisma attribute; it is documented by a comment above `OrderStatusAudit` in `prisma/schema.prisma`. `FAQChunk.chunkIndex` remains nullable until approved documents are chunked and a later migration sets it required.

Business scoping, renames, the vector column, and duplicate-index cleanup are deliberately not included. Those need separate owner decisions.

## If you must undo

Only while the new table and columns are unused, and only if you accept losing any data written since the migration:

```sql
ALTER TABLE "OrderStatusAudit" DROP CONSTRAINT IF EXISTS "OrderStatusAudit_actor_check";
ALTER TABLE "AssistantMessage" DROP CONSTRAINT IF EXISTS "AssistantMessage_userId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_measurementId_fkey";
DROP TABLE IF EXISTS "AssistantMessage";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "measurementId",
  DROP COLUMN IF EXISTS "currency";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "providerTxId",
  DROP COLUMN IF EXISTS "provider",
  DROP COLUMN IF EXISTS "currency";
ALTER TABLE "FAQChunk" DROP COLUMN IF EXISTS "chunkIndex";
```

Then remove the migration folder from version control and run `npx prisma migrate resolve --rolled-back 20261127130000_align_columns_add_assistant_message` so Prisma's history matches the database.
