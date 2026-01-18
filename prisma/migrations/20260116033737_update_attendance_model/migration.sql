-- AlterTable
ALTER TABLE "Attendance"
ADD COLUMN "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
ADD COLUMN "comment" TEXT,
ADD COLUMN "proofUrl" TEXT,
ADD COLUMN "createdBy" "AttendanceActor" NOT NULL DEFAULT 'TEACHER',
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_lessonId_date_key" ON "Attendance" (
    "studentId",
    "lessonId",
    "date"
);