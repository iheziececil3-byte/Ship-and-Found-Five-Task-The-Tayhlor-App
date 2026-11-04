-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'TAILOR');

-- CreateEnum
CREATE TYPE "RecordEnvironment" AS ENUM ('LIVE', 'TEST', 'PREVIEW');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'READY_FOR_COLLECTION', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'BALANCE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "FittingOutcome" AS ENUM ('SATISFACTORY', 'ALTERATIONS_REQUIRED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'APPROVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT,
    "googleSubject" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "chest" DECIMAL(5,2),
    "waist" DECIMAL(5,2),
    "hip" DECIMAL(5,2),
    "shoulder" DECIMAL(5,2),
    "sleeve" DECIMAL(5,2),
    "inseam" DECIMAL(5,2),
    "length" DECIMAL(5,2),
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "garmentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "measurementsSnapshot" JSONB NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'SUBMITTED',
    "declineReason" TEXT,
    "cancellationReason" TEXT,
    "quotedTotal" INTEGER,
    "proposedCompletionDate" TIMESTAMP(3),
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusAudit" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "previousStatus" "OrderStatus",
    "newStatus" "OrderStatus" NOT NULL,
    "note" TEXT,
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paystackReference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fitting" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "outcome" "FittingOutcome" NOT NULL,
    "fittingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tailorNotes" TEXT,
    "recordedById" TEXT NOT NULL,
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fitting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "heading" TEXT,
    "content" TEXT NOT NULL,
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FAQChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAudit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "changedByTailorId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "recordEnvironment" "RecordEnvironment" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSubject_key" ON "User"("googleSubject");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_recordEnvironment_idx" ON "User"("recordEnvironment");

-- CreateIndex
CREATE INDEX "Business_recordEnvironment_idx" ON "Business"("recordEnvironment");

-- CreateIndex
CREATE INDEX "Measurement_userId_idx" ON "Measurement"("userId");

-- CreateIndex
CREATE INDEX "Measurement_recordEnvironment_idx" ON "Measurement"("recordEnvironment");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_recordEnvironment_idx" ON "Order"("recordEnvironment");

-- CreateIndex
CREATE INDEX "OrderStatusAudit_orderId_idx" ON "OrderStatusAudit"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusAudit_actorId_idx" ON "OrderStatusAudit"("actorId");

-- CreateIndex
CREATE INDEX "OrderStatusAudit_recordEnvironment_idx" ON "OrderStatusAudit"("recordEnvironment");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paystackReference_key" ON "Payment"("paystackReference");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_paystackReference_idx" ON "Payment"("paystackReference");

-- CreateIndex
CREATE INDEX "Payment_recordEnvironment_idx" ON "Payment"("recordEnvironment");

-- CreateIndex
CREATE INDEX "Fitting_orderId_idx" ON "Fitting"("orderId");

-- CreateIndex
CREATE INDEX "Fitting_recordEnvironment_idx" ON "Fitting"("recordEnvironment");

-- CreateIndex
CREATE INDEX "FAQDocument_status_idx" ON "FAQDocument"("status");

-- CreateIndex
CREATE INDEX "FAQDocument_recordEnvironment_idx" ON "FAQDocument"("recordEnvironment");

-- CreateIndex
CREATE INDEX "FAQChunk_documentId_idx" ON "FAQChunk"("documentId");

-- CreateIndex
CREATE INDEX "FAQChunk_recordEnvironment_idx" ON "FAQChunk"("recordEnvironment");

-- CreateIndex
CREATE INDEX "ContactAudit_customerId_idx" ON "ContactAudit"("customerId");

-- CreateIndex
CREATE INDEX "ContactAudit_recordEnvironment_idx" ON "ContactAudit"("recordEnvironment");

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusAudit" ADD CONSTRAINT "OrderStatusAudit_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusAudit" ADD CONSTRAINT "OrderStatusAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fitting" ADD CONSTRAINT "Fitting_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fitting" ADD CONSTRAINT "Fitting_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQChunk" ADD CONSTRAINT "FAQChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "FAQDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAudit" ADD CONSTRAINT "ContactAudit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
