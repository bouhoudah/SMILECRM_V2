import asyncHandler from 'express-async-handler';
import { NotFoundError } from '../utils/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/contacts
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await prisma.contact.findMany({
    orderBy: { dateCreation: 'desc' },
    include: {
      commentaires: true,
      historique: true,
      contrats: true,
      documents: true,
      agence: true
    }
  });
  res.json(contacts);
});

// GET /api/contacts/:id
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await prisma.contact.findUnique({
    where: { id: parseInt(req.params.id, 10) },
    include: {
      commentaires: true,
      historique: true,
      contrats: true,
      documents: true,
      agence: true
    }
  });

  if (!contact) {
    throw new NotFoundError('Contact non trouvé');
  }

  res.json(contact);
});

// POST /api/contacts
// POST /api/contacts
export const createContact = asyncHandler(async (req, res) => {
  const {
    prenom,
    nom,
    email,
    telephone,
    statut,
    entreprise,
    siret,
    photoUrl,
    agenceId,
    utilisateurId,
    particulier,
    professionnel,
    professionalType,
    portalAccess,
    numeroRue,
    rue,
    complement,
    codePostal,
    ville,
    pays,
    parrainNom,
    parrainPrenom,
    contrats // <- important
  } = req.body;

  // Règle métier : un contact de type "client" doit avoir au moins un contrat
  if (statut === 'client' && (!contrats || contrats.length === 0)) {
    return res.status(400).json({
      error: "Un client doit obligatoirement avoir au moins un contrat."
    });
  }

  const contact = await prisma.contact.create({
    data: {
      prenom,
      nom,
      email,
      telephone,
      statut,
      entreprise,
      siret,
      photoUrl,
      agenceId,
      particulier,
      professionnel,
      professionalType,
      portalAccess,
      numeroRue,
      rue,
      complement,
      codePostal,
      ville,
      pays,
      parrainNom,
      parrainPrenom,
      historique: {
        create: {
          type: 'creation',
          description: 'Création du contact',
          utilisateurId: utilisateurId || 1
        }
      },
      // Crée les contrats si présents
      contrats: contrats?.length ? {
        create: contrats
      } : undefined
    },
    include: {
      historique: true,
      contrats: true
    }
  });

  res.status(201).json(contact);
});


// PUT /api/contacts/:id
export const updateContact = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const updatedContact = await prisma.contact.update({
    where: { id },
    data: req.body
  });

  // Historique de la modification
  await prisma.historique.create({
    data: {
      contactId: id,
      type: 'modification',
      description: 'Modification du contact',
      utilisateurId: req.body.utilisateurId || 1
    }
  });

  res.json(updatedContact);
});

// DELETE /api/contacts/:id
export const deleteContact = asyncHandler(async (req, res) => {
  await prisma.contact.delete({
    where: { id: parseInt(req.params.id, 10) }
  });
  res.status(204).end();
});
