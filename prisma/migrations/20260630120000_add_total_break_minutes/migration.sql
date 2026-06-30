-- Add totalBreakMinutes to Attendance
ALTER TABLE "Attendance"
ADD COLUMN "totalBreakMinutes" INTEGER NOT NULL DEFAULT 0;
