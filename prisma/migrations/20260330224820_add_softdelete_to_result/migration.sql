/*
  Warnings:

  - Made the column `deletedAt` on table `Result` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "deletedAt" SET NOT NULL,
ALTER COLUMN "deletedAt" SET DEFAULT CURRENT_TIMESTAMP;
