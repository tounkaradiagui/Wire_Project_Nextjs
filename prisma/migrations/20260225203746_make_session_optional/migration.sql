/*
  Warnings:

  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,sessionId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- DropIndex
DROP INDEX "Attendance_studentId_lessonId_date_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "date",
DROP COLUMN "lessonId",
ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "code" TEXT;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "room" TEXT,
    "lessonId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_sessionId_key" ON "Attendance"("studentId", "sessionId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
