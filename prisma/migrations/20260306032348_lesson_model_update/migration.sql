/*
  Warnings:

  - You are about to drop the column `day` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "day",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
