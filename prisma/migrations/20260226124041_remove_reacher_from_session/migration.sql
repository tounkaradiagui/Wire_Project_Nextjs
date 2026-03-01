/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Session` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_teacherId_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "teacherId";
