/*
  Warnings:

  - You are about to drop the column `supervisorId` on the `Class` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_supervisorId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "supervisorId";
