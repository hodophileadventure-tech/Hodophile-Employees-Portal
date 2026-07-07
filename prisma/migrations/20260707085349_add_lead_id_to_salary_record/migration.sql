/*
  Warnings:

  - A unique constraint covering the columns `[leadId]` on the table `SalaryRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SalaryRecord" ADD COLUMN     "leadId" TEXT;

-- AlterTable
ALTER TABLE "SalesLead" ALTER COLUMN "customerName" DROP DEFAULT,
ALTER COLUMN "customerNumber" DROP DEFAULT,
ALTER COLUMN "destination" DROP DEFAULT,
ALTER COLUMN "persons" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRecord_leadId_key" ON "SalaryRecord"("leadId");

-- CreateIndex
CREATE INDEX "SalaryRecord_leadId_idx" ON "SalaryRecord"("leadId");
