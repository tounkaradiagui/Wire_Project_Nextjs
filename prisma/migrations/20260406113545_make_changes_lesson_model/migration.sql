/*
  Warnings:

  - You are about to drop the column `duration` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "duration",
ADD COLUMN     "endTime" INTEGER,
ADD COLUMN     "startTime" INTEGER,
ADD COLUMN     "weekDay" INTEGER;
