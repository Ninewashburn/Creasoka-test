/*
  Warnings:

  - You are about to drop the column `category` on the `Creation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Creation" DROP COLUMN "category",
ADD COLUMN     "categories" TEXT[];
