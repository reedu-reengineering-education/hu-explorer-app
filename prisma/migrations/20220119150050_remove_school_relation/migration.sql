/*
  Warnings:

  - You are about to drop the column `schuleId` on the `ArtenvielfaltRecord` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArtenvielfaltRecord" DROP CONSTRAINT "ArtenvielfaltRecord_schuleId_fkey";

-- AlterTable
ALTER TABLE "ArtenvielfaltRecord" DROP COLUMN "schuleId";
