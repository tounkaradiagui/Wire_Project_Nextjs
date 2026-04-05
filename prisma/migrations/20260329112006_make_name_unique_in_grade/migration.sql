/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `Grade` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Grade" ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Grade_name_key" ON "Grade"("name");
