import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Fonction pour générer une référence unique
function generateReference() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `CONT-${year}_${month}_${random}`;
}

// GET /contrats - Récupérer tous les contrats
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const contrats = await prisma.contrat.findMany({
      orderBy: { dateDebut: 'desc' },
      include: {
        client: true,
        partenaire: true,
        historique: true
      }
    });

    res.json(contrats);
  })
);

// GET /contrats/:id - Récupérer un contrat par ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const contrat = await prisma.contrat.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: true,
        partenaire: true,
        historique: true
      }
    });

    if (!contrat) return res.status(404).json({ error: 'Contrat non trouvé' });
    res.json(contrat);
  })
);

// POST /contrats - Créer un contrat
// POST /api/contrats - Créer un nouveau contrat
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
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
      typeRisque,
      formuleProduit,
      porteurDeRisque,
      dateResiliation,
      raisonResiliation,
      fraisDeCourtage
    } = req.body;

    const reference = generateReference();

    const newContrat = await prisma.contrat.create({
      data: {
        reference,
        clientId: Number(clientId),
        type,
        categorie,
        statut,
        montantAnnuel: parseFloat(montantAnnuel),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        partenaireId: Number(partenaireId),
        commissionPremiereAnnee: parseFloat(commissionPremiereAnnee),
        commissionAnneesSuivantes: parseFloat(commissionAnneesSuivantes),
        fraisDossier: parseFloat(fraisDossier),
        fraisDossierRecurrent: !!fraisDossierRecurrent,
        typeRisque,
        formuleProduit,
        porteurDeRisque,
        dateResiliation: dateResiliation ? new Date(dateResiliation) : null,
        raisonResiliation,
        fraisDeCourtage: parseFloat(fraisDeCourtage) || 0
      }
    });

    // Mise à jour du statut du contact s'il est prospect
    const client = await prisma.contact.findUnique({
      where: { id: Number(clientId) }
    });

    if (client?.statut === 'prospect') {
      await prisma.contact.update({
        where: { id: Number(clientId) },
        data: { statut: 'client' }
      });
    }

    res.status(201).json(newContrat);
  })
);



// DELETE /contrats/:id - Supprimer un contrat
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.contrat.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(204).end();
  })
);

export default router;
