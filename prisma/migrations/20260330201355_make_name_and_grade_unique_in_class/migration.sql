/*
  Warnings:

  - A unique constraint covering the columns `[name,gradeId]` on the table `Class` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Class_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_gradeId_key" ON "Class"("name", "gradeId");
