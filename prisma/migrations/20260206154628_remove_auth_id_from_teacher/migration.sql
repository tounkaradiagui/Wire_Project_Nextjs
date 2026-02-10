/*
  Warnings:

  - You are about to drop the column `authId` on the `Teacher` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Teacher_authId_key";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "authId";
