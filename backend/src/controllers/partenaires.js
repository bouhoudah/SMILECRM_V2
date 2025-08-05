import asyncHandler from 'express-async-handler';
import { NotFoundError } from '../utils/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/partenaires
export const getPartners = asyncHandler(async (req, res) => {
  const partenaires = await prisma.partenaire.findMany({
    orderBy: { nom: 'asc' }, // ✅ pour un affichage trié
    include: { contrats: true } // ✅ si tu veux les contrats associés
  });
  res.json(partenaires);
});

// GET /api/partenaires/:id
export const getPartnerById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new NotFoundError('ID invalide');

  const partenaire = await prisma.partenaire.findUnique({
    where: { id },
    include: { contrats: true } // ✅ optionnel selon ton front
  });

  if (!partenaire) {
    throw new NotFoundError('Partenaire non trouvé');
  }

  res.json(partenaire);
});

// POST /api/partenaires
export const createPartner = asyncHandler(async (req, res) => {
  const {
    nom,
    type,
    statut,
    email,
    telephone,
    siteWeb,
    intranetUrl,
    logoUrl,
    contactPrincipal,
    produits
  } = req.body;

  const newPartenaire = await prisma.partenaire.create({
    data: {
      nom,
      type,
      statut,
      email,
      telephone,
      siteWeb,
      intranetUrl,
      logoUrl,
      contactPrincipal,
      produits
    }
  });

  res.status(201).json(newPartenaire);
});

// PUT /api/partenaires/:id
export const updatePartner = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new NotFoundError('ID invalide');

  const updatedPartenaire = await prisma.partenaire.update({
    where: { id },
    data: req.body
  });

  res.json(updatedPartenaire);
});

// DELETE /api/partenaires/:id
export const deletePartner = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new NotFoundError('ID invalide');

  await prisma.partenaire.delete({
    where: { id }
  });

  res.status(204).end();
});
