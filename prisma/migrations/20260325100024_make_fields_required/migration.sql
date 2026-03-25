/*
  Warnings:

  - Made the column `cardExpiresAt` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verificationToken` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "cardExpiresAt" SET NOT NULL,
ALTER COLUMN "verificationToken" SET NOT NULL;
