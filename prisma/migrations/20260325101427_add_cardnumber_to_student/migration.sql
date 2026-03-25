/*
  Warnings:

  - A unique constraint covering the columns `[cardNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "cardNumber" VARCHAR(7);

-- CreateIndex
CREATE UNIQUE INDEX "Student_cardNumber_key" ON "Student"("cardNumber");
