/*
  Warnings:

  - You are about to drop the column `animalId` on the `ArtenvielfaltRecord` table. All the data in the column will be lost.
  - You are about to drop the `Animal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `art` to the `ArtenvielfaltRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ArtenvielfaltRecord" DROP CONSTRAINT "ArtenvielfaltRecord_animalId_fkey";

-- AlterTable
ALTER TABLE "ArtenvielfaltRecord" DROP COLUMN "animalId",
ADD COLUMN     "art" TEXT NOT NULL;

-- DropTable
DROP TABLE "Animal";
