import asyncHandler from 'express-async-handler';
import { NotFoundError } from '../utils/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/contrats
export const getContracts = asyncHandler(async (req, res) => {
  const contrats = await prisma.contrat.findMany({
    orderBy: { dateDebut: 'desc' },
    include: {
      client: true,
      partenaire: true,
      historique: true
    }
  });
  res.json(contrats);
});

// GET /api/contrats/:id
export const getContractById = asyncHandler(async (req, res) => {
  const contrat = await prisma.contrat.findUnique({
    where: { id: parseInt(req.params.id, 10) },
    include: {
      client: true,
      partenaire: true,
      historique: true
    }
  });

  if (!contrat) {
    throw new NotFoundError('Contrat non trouvé');
  }

  res.json(contrat);
});

// POST /api/contrats
// POST /api/contrats
export const createContract = asyncHandler(async (req, res) => {
  console.log("🛬 Données reçues côté backend :", req.body);
  const {
    reference,
    clientId,
    type,
    categorie,
    montantAnnuel,
    dateDebut,
    dateFin,
    partenaireId,
    statut,
    commissionPremiereAnnee,
    commissionAnneesSuivantes,
    fraisDossier,
    fraisDossierRecurrent,
    typeRisque,
    formuleProduit,
    porteurDeRisque,
    dateResiliation,
    raisonResiliation,
    fraisDeCourtage,
    utilisateurId
  } = req.body;

  const contrat = await prisma.contrat.create({
    data: {
      reference,
      clientId,
      type,
      categorie,
      montantAnnuel,
      dateDebut,
      dateFin,
      partenaireId,
      statut,
      commissionPremiereAnnee,
      commissionAnneesSuivantes,
      fraisDossier,
      fraisDossierRecurrent,
      typeRisque,
      formuleProduit,
      porteurDeRisque,
      dateResiliation: dateResiliation || null,
      raisonResiliation: raisonResiliation || null,
      fraisDeCourtage
    },
    include: {
      historique: true
    }
});


  // Mise à jour du contact en "client"
  await prisma.contact.update({
    where: { id: clientId },
    data: { statut: 'client' }
  });

  // Historique
  await prisma.historique.create({
    data: {
      contactId: clientId,
      type: 'creation',
      description: 'Création d’un contrat',
      utilisateurId: utilisateurId || 1
    }
  });

  res.status(201).json(contrat);
});


// PUT /api/contrats/:id
// PUT /api/contrats/:id
export const updateContract = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const {
    reference,
    clientId,
    type,
    categorie,
    statut,
    montantAnnuel,
    dateDebut,
    dateFin,
    partenaireId,
    commissionPremiereAnnee,
    commissionAnneesSuivantes,
    fraisDossier,
    fraisDossierRecurrent,
    fraisDeCourtage,
    typeRisque,
    formuleProduit,
    dateResiliation,
    raisonResiliation,
    porteurDeRisque,
    utilisateurId
  } = req.body;

  const updated = await prisma.contrat.update({
    where: { id },
    data: {
      reference,
      clientId,
      type,
      categorie,
      statut,
      montantAnnuel,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      partenaireId,
      commissionPremiereAnnee,
      commissionAnneesSuivantes,
      fraisDossier,
      fraisDossierRecurrent,
      fraisDeCourtage,
      typeRisque,
      formuleProduit,
      dateResiliation: dateResiliation ? new Date(dateResiliation) : undefined,
      raisonResiliation,
      porteurDeRisque
    }
  });

  // Historique
  await prisma.historique.create({
    data: {
      contactId: clientId,
      type: 'modification',
      description: 'Modification du contrat',
      utilisateurId: utilisateurId || 1
    }
  });

  res.json(updated);
});


// DELETE /api/contrats/:id
export const deleteContract = asyncHandler(async (req, res) => {
  await prisma.contrat.delete({
    where: { id: parseInt(req.params.id, 10) }
  });

  res.status(204).end();
});
