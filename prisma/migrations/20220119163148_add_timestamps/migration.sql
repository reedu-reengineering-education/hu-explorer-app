/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ArtenvielfaltRecord` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `VersiegelungRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ArtenvielfaltRecord" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "VersiegelungRecord" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
