import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Créer un nouveau commentaire
router.post('/create', async (req, res) => {
  const { contenu, contactId, utilisateurId } = req.body;

  if (!contenu || !contactId || !utilisateurId) {
    return res.status(400).json({ error: 'contenu, contactId et utilisateurId sont requis' });
  }

  try {
    const nouveauCommentaire = await prisma.commentaire.create({
      data: {
        contenu,
        contactId: Number(contactId),
        utilisateurId: Number(utilisateurId),
      },
    });
    res.status(201).json(nouveauCommentaire);
  } catch (error) {
    console.error('Erreur création commentaire :', error);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
});

// Récupérer les commentaires d’un contact
router.get('/contact/:id', async (req, res) => {
  const contactId = Number(req.params.id);
  try {
    const commentaires = await prisma.commentaire.findMany({
      where: { contactId },
      include: { utilisateur: true },
      orderBy: { date: 'desc' },
    });
    res.json(commentaires);
  } catch (error) {
    console.error('Erreur récupération commentaires :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
});

// Modifier un commentaire
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { contenu } = req.body;

  if (!contenu) {
    return res.status(400).json({ error: 'Le contenu est requis' });
  }

  try {
    const commentaireModifie = await prisma.commentaire.update({
      where: { id },
      data: { contenu },
    });
    res.json(commentaireModifie);
  } catch (error) {
    console.error('Erreur modification commentaire :', error);
    res.status(500).json({ error: 'Erreur lors de la modification du commentaire' });
  }
});

// Supprimer un commentaire
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.commentaire.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression commentaire :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
  }
});

export default router;
