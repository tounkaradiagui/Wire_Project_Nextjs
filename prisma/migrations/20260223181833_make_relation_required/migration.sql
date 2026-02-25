/*
  Warnings:

  - Made the column `userProfileId` on table `Admin` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userProfileId` on table `Parent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userProfileId` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userProfileId` on table `Teacher` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Parent" DROP CONSTRAINT "Parent_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_userProfileId_fkey";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "userProfileId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Parent" ALTER COLUMN "userProfileId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "userProfileId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "userProfileId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
