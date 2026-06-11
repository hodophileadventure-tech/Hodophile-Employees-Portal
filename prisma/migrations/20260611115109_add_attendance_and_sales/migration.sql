-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "logoutTime" TEXT;
ALTER TABLE "Employee" ADD COLUMN "reportingTime" TEXT;

-- CreateTable
CREATE TABLE "SalesLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "leadWorth" REAL NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" DATETIME,
    "commission" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesLead_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SalaryRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "month" DATETIME NOT NULL,
    "daysWorked" INTEGER NOT NULL,
    "totalSalary" REAL NOT NULL,
    "earnedSalary" REAL NOT NULL,
    "deductions" REAL NOT NULL DEFAULT 0,
    "commission" REAL NOT NULL DEFAULT 0,
    "monthlyIncentive" REAL NOT NULL DEFAULT 0,
    "netSalary" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalaryRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SalaryRecord" ("createdAt", "daysWorked", "deductions", "earnedSalary", "employeeId", "id", "month", "netSalary", "status", "totalSalary", "updatedAt") SELECT "createdAt", "daysWorked", "deductions", "earnedSalary", "employeeId", "id", "month", "netSalary", "status", "totalSalary", "updatedAt" FROM "SalaryRecord";
DROP TABLE "SalaryRecord";
ALTER TABLE "new_SalaryRecord" RENAME TO "SalaryRecord";
CREATE INDEX "SalaryRecord_employeeId_idx" ON "SalaryRecord"("employeeId");
CREATE INDEX "SalaryRecord_month_idx" ON "SalaryRecord"("month");
CREATE UNIQUE INDEX "SalaryRecord_employeeId_month_key" ON "SalaryRecord"("employeeId", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SalesLead_employeeId_idx" ON "SalesLead"("employeeId");

-- CreateIndex
CREATE INDEX "SalesLead_confirmedAt_idx" ON "SalesLead"("confirmedAt");
