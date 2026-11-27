-- Adds the missing columns and indexes from the schema audit, plus the
-- AssistantMessage log table and the DAT-11 actor CHECK constraint. Additive
-- only: no table or column is dropped or renamed, and no existing value is
-- rewritten. Model and column names are unchanged.

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "measurementId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'paystack',
ADD COLUMN     "providerTxId" TEXT;

-- AlterTable
ALTER TABLE "FAQChunk" ADD COLUMN     "chunkIndex" INTEGER;

-- CreateTable
CREATE TABLE "AssistantMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sourceChunkIds" TEXT[],
    "grounded" BOOLEAN NOT NULL,
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantMessage_userId_createdAt_idx" ON "AssistantMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AssistantMessage_createdAt_idx" ON "AssistantMessage"("createdAt");

-- CreateIndex
CREATE INDEX "AssistantMessage_recordEnvironment_idx" ON "AssistantMessage"("recordEnvironment");

-- CreateIndex
CREATE INDEX "Measurement_userId_recordEnvironment_idx" ON "Measurement"("userId", "recordEnvironment");

-- CreateIndex
CREATE INDEX "Fitting_recordedById_idx" ON "Fitting"("recordedById");

-- CreateIndex
CREATE INDEX "Payment_orderId_type_status_idx" ON "Payment"("orderId", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FAQChunk_documentId_chunkIndex_key" ON "FAQChunk"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "ContactAudit_customerId_recordEnvironment_idx" ON "ContactAudit"("customerId", "recordEnvironment");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantMessage" ADD CONSTRAINT "AssistantMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddConstraint
-- SQL-only CHECK required by DAT-11; Prisma cannot express CHECK constraints.
-- The owner must run the precheck in RUN_SHEET.md before applying this migration.
ALTER TABLE "OrderStatusAudit" ADD CONSTRAINT "OrderStatusAudit_actor_check" CHECK (
    ("actorType" = 'USER' AND "actorId" IS NOT NULL)
    OR ("actorType" = 'SYSTEM' AND "actorId" IS NULL)
);
