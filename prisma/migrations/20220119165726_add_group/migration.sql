/*
  Warnings:

  - Added the required column `group` to the `ArtenvielfaltRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArtenvielfaltRecord" ADD COLUMN     "group" TEXT NOT NULL;
