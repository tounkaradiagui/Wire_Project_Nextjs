/*
  Warnings:

  - Made the column `firstName` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;
