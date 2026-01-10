/*
  Warnings:

  - Made the column `sex` on table `Parent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Parent" ALTER COLUMN "sex" SET NOT NULL;
