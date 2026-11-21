-- AlterTable
-- Adds the verification code columns used by the email verification flow.
-- IF NOT EXISTS keeps this safe to run manually when one or both columns
-- are already present in the target database.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "verificationCode" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationExpires" TIMESTAMP(3);
