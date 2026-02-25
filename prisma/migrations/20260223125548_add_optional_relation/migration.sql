/*
  Warnings:

  - A unique constraint covering the columns `[userProfileId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userProfileId]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userProfileId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userProfileId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "userProfileId" TEXT;

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "userProfileId" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "userProfileId" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "userProfileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userProfileId_key" ON "Admin"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_userProfileId_key" ON "Parent"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userProfileId_key" ON "Student"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userProfileId_key" ON "Teacher"("userProfileId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
