/*
  Warnings:

  - Added the required column `subjectId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "appreciation" TEXT,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "subjectId" INTEGER NOT NULL,
ADD COLUMN     "teacherId" TEXT NOT NULL,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Result_studentId_subjectId_idx" ON "Result"("studentId", "subjectId");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
