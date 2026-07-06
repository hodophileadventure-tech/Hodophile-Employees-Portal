/*
  Warnings:

  - Added the required column `customerName` to the `SalesLead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerNumber` to the `SalesLead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `SalesLead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `persons` to the `SalesLead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesLead" ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "destination" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "persons" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Break" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "breakStart" TIMESTAMP(3) NOT NULL,
    "breakEnd" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Break_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Break_employeeId_idx" ON "Break"("employeeId");

-- CreateIndex
CREATE INDEX "Break_date_idx" ON "Break"("date");

-- AddForeignKey
ALTER TABLE "Break" ADD CONSTRAINT "Break_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
