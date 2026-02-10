/*
  Warnings:

  - Made the column `authId` on table `Teacher` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "authId" SET NOT NULL;
