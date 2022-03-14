/*
  Warnings:

  - You are about to drop the column `area` on the `VersiegelungRecord` table. All the data in the column will be lost.
  - Made the column `deviceId` on table `VersiegelungRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VersiegelungRecord" DROP COLUMN "area",
ALTER COLUMN "deviceId" SET NOT NULL;
