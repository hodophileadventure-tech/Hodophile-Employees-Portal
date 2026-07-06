-- Add missing sourceSystem to SalesLead if it does not exist
ALTER TABLE "SalesLead" ADD COLUMN IF NOT EXISTS "sourceSystem" TEXT;
