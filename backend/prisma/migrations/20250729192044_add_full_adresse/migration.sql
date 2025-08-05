/*
  Warnings:

  - You are about to drop the column `adresse` on the `contacts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "adresse",
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "numeroRue" TEXT,
ADD COLUMN     "pays" TEXT,
ADD COLUMN     "rue" TEXT;
