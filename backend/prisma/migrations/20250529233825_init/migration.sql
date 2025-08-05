-- CreateEnum
CREATE TYPE "ContratType" AS ENUM ('auto', 'habitation', 'sante', 'vie', 'prevoyance', 'autre');

-- CreateEnum
CREATE TYPE "ContratCategorie" AS ENUM ('particulier', 'professionnel');

-- CreateEnum
CREATE TYPE "ContratStatut" AS ENUM ('actif', 'en_cours', 'resilie', 'suspendu');

-- CreateEnum
CREATE TYPE "PartenaireType" AS ENUM ('assureur', 'courtier_grossiste');

-- CreateEnum
CREATE TYPE "PartenaireStatut" AS ENUM ('actif', 'inactif');

-- CreateEnum
CREATE TYPE "ContactStatut" AS ENUM ('prospect', 'client');

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "particulier" BOOLEAN NOT NULL DEFAULT false,
    "professionnel" BOOLEAN NOT NULL DEFAULT false,
    "professionalType" TEXT,
    "statut" "ContactStatut" NOT NULL,
    "entreprise" TEXT,
    "siret" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photoUrl" TEXT,
    "portalAccess" JSONB,
    "agenceId" INTEGER,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique_contacts" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "utilisateurId" INTEGER NOT NULL,

    CONSTRAINT "historique_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "type" "ContratType" NOT NULL,
    "categorie" "ContratCategorie" NOT NULL,
    "statut" "ContratStatut" NOT NULL,
    "montantAnnuel" DOUBLE PRECISION NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "partenaireId" INTEGER NOT NULL,
    "commissionPremiereAnnee" DOUBLE PRECISION NOT NULL,
    "commissionAnneesSuivantes" DOUBLE PRECISION NOT NULL,
    "fraisDossier" DOUBLE PRECISION NOT NULL,
    "fraisDossierRecurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrat_historique" (
    "id" SERIAL NOT NULL,
    "contratId" INTEGER NOT NULL,
    "montantAnnuel" DOUBLE PRECISION NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "commissionPremiereAnnee" DOUBLE PRECISION NOT NULL,
    "commissionAnneesSuivantes" DOUBLE PRECISION NOT NULL,
    "fraisDossier" DOUBLE PRECISION NOT NULL,
    "fraisDossierRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "contrat_historique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "dateUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "metadonnees" JSONB,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partenaires" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "PartenaireType" NOT NULL,
    "produits" TEXT[],
    "statut" "PartenaireStatut" NOT NULL,
    "contactPrincipal" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "siteWeb" TEXT,
    "intranetUrl" TEXT,
    "logoUrl" TEXT,

    CONSTRAINT "partenaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agence" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commentaire" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,

    CONSTRAINT "Commentaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contrats_reference_key" ON "contrats"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_contacts" ADD CONSTRAINT "historique_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_contacts" ADD CONSTRAINT "historique_contacts_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_partenaireId_fkey" FOREIGN KEY ("partenaireId") REFERENCES "partenaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrat_historique" ADD CONSTRAINT "contrat_historique_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commentaire" ADD CONSTRAINT "Commentaire_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
