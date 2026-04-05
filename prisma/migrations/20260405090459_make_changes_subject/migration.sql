/*
  Warnings:

  - The `coefficient` column on the `Subject` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "TeacherClass" DROP CONSTRAINT "TeacherClass_teacherId_fkey";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "coefficient",
ADD COLUMN     "coefficient" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "TeacherClass" ADD CONSTRAINT "TeacherClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
