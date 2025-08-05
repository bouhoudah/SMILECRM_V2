-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExp" TIMESTAMP(3);
