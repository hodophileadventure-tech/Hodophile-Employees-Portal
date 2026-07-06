-- Add missing sourceLeadId to SalesLead if it does not exist
ALTER TABLE "SalesLead" ADD COLUMN IF NOT EXISTS "sourceLeadId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "SalesLead_sourceLeadId_key" ON "SalesLead"("sourceLeadId");
