/*
  Warnings:

  - A unique constraint covering the columns `[studentId,examId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,assignmentId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Result_studentId_subjectId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_examId_key" ON "Result"("studentId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_assignmentId_key" ON "Result"("studentId", "assignmentId");
