-- CreateEnum
CREATE TYPE "CycleEnum" AS ENUM ('FIRST', 'SECOND');

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "cycle" "CycleEnum";
