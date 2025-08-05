import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /partenaires - Récupérer tous les partenaires
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const partenaires = await prisma.partenaire.findMany({
      orderBy: { nom: 'asc' },
      include: { contrats: true }
    });
    res.json(partenaires);
  })
);

// GET /partenaires/:id - Récupérer un partenaire par ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const partenaire = await prisma.partenaire.findUnique({
      where: { id },
      include: { contrats: true }
    });

    if (!partenaire) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }

    res.json(partenaire);
  })
);

// POST /partenaires - Créer un nouveau partenaire
router.post(
  '/',
  asyncHandler(async (req, res) => {
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

    const partenaire = await prisma.partenaire.create({
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

    res.status(201).json(partenaire);
  })
);

// PUT /partenaires/:id - Modifier un partenaire
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

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

    const partenaire = await prisma.partenaire.update({
      where: { id },
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

    res.json(partenaire);
  })
);

// DELETE /partenaires/:id - Supprimer un partenaire
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    await prisma.partenaire.delete({
      where: { id }
    });

    res.status(204).end();
  })
);

export default router;
