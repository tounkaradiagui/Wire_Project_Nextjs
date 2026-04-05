/*
  Warnings:

  - Made the column `cycle` on table `Grade` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Grade" ALTER COLUMN "cycle" SET NOT NULL;
