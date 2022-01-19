/*
  Warnings:

  - You are about to drop the column `schuleId` on the `VersiegelungRecord` table. All the data in the column will be lost.
  - Added the required column `group` to the `VersiegelungRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `VersiegelungRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VersiegelungRecord" DROP CONSTRAINT "VersiegelungRecord_schuleId_fkey";

-- AlterTable
ALTER TABLE "VersiegelungRecord" DROP COLUMN "schuleId",
ADD COLUMN     "group" TEXT NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "area" DROP NOT NULL;
