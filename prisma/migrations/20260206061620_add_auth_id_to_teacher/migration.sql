/*
  Warnings:

  - A unique constraint covering the columns `[authId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "authId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_authId_key" ON "Teacher"("authId");
