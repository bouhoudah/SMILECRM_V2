-- AlterTable
ALTER TABLE "contrats" ADD COLUMN     "dateResiliation" TIMESTAMP(3),
ADD COLUMN     "formuleProduit" TEXT,
ADD COLUMN     "fraisDeCourtage" DOUBLE PRECISION,
ADD COLUMN     "porteurDeRisque" TEXT,
ADD COLUMN     "raisonResiliation" TEXT,
ADD COLUMN     "typeRisque" TEXT;
