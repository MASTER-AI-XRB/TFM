ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pendingEmail" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifyTokenExpiry" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "User_emailVerifyToken_idx" ON "User"("emailVerifyToken");
