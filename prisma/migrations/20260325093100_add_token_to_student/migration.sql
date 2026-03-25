/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "cardExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_verificationToken_key" ON "Student"("verificationToken");
