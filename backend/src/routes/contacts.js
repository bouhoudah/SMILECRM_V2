import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /contacts - Récupérer tous les contacts
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const contacts = await prisma.contact.findMany({
      orderBy: { dateCreation: 'desc' },
      include: {
        commentaires: true,
        historique: true,
        contrats: true,
        documents: true
      }
    });

    const mappedContacts = contacts.map(contact => ({
      ...contact,
      types: {
        particulier: contact.particulier,
        professionnel: contact.professionnel,
        professionalType: contact.professionalType
      }
    }));

    res.json(mappedContacts);
  })
);

// GET /contacts/:id - Récupérer un contact par ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const contact = await prisma.contact.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        commentaires: true,
        historique: true,
        contrats: true,
        documents: true
      }
    });

    if (!contact) return res.status(404).json({ error: 'Contact non trouvé' });
    res.json({
      ...contact,
      types: {
        particulier: contact.particulier,
        professionnel: contact.professionnel,
        professionalType: contact.professionalType
      }
    });
  })
);

// POST /contacts - Créer un nouveau contact
router.post(
  '/',
  asyncHandler(async (req, res) => {
    // 🔄 Réalignement de la séquence
    await prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('public.contacts','id'),
        (SELECT COALESCE(MAX(id), 0) FROM public.contacts),
        true
      );
    `;

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
      dateNaissance,
      numeroRue,
      rue,
      complement,
      codePostal,
      ville,
      pays,
      parrainNom,
      parrainPrenom,
      // 👇 Champs comptable
      comptableNom,
      comptablePrenom,
      comptableTelephone,
      comptableEmail
    } = req.body;

    const { contrats = [] } = req.body;

    const newContact = await prisma.contact.create({
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
        particulier: !!particulier,
        professionnel: !!professionnel,
        professionalType,
        portalAccess,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        numeroRue,
        rue,
        complement,
        codePostal,
        ville,
        pays,
        parrainNom,
        parrainPrenom,
        // ✅ Ajout des champs comptable
        comptableNom,
        comptablePrenom,
        comptableTelephone,
        comptableEmail,
        ...(utilisateurId && !isNaN(Number(utilisateurId)) && {
          historique: {
            create: {
              type: 'creation',
              description: 'Création du contact',
              utilisateurId: Number(utilisateurId)
            }
          }
        }),
        ...(contrats.length > 0 && {
          contrats: {
            create: contrats.map(c => ({
              reference: c.reference,
              type: c.type,
              categorie: c.categorie,
              montantAnnuel: Number(c.montantAnnuel),
              dateDebut: new Date(c.dateDebut),
              dateFin: new Date(c.dateFin),
              statut: c.statut,
              commissionPremiereAnnee: Number(c.commissionPremiereAnnee),
              commissionAnneesSuivantes: Number(c.commissionAnneesSuivantes),
              fraisDossier: Number(c.fraisDossier),
              fraisDossierRecurrent: !!c.fraisDossierRecurrent,
              partenaireId: Number(c.partenaireId)
            }))
          }
        })
      },
      include: {
        historique: true,
        contrats: true
      }
    });

    res.status(201).json(newContact);
  })
);

// PUT /contacts/:id - Mettre à jour un contact
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const {
      prenom,
      nom,
      email,
      telephone,
      statut,
      entreprise,
      siret,
      photoUrl,
      portalAccess,
      utilisateurId,
      particulier,
      professionnel,
      professionalType,
      dateNaissance,
      // 👇 Champs comptable
      comptableNom,
      comptablePrenom,
      comptableTelephone,
      comptableEmail
    } = req.body;

    const updatedContact = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data: {
        prenom,
        nom,
        email,
        telephone,
        statut,
        entreprise,
        siret,
        photoUrl,
        portalAccess,
        particulier,
        professionnel,
        professionalType,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        // ✅ Mise à jour des champs comptable
        comptableNom,
        comptablePrenom,
        comptableTelephone,
        comptableEmail
      }
    });

    if (utilisateurId && !isNaN(Number(utilisateurId))) {
      await prisma.historique.create({
        data: {
          contact: { connect: { id: Number(req.params.id) } },
          type: 'modification',
          description: 'Modification du contact',
          utilisateurId: Number(utilisateurId)
        }
      });
    }

    res.json(updatedContact);
  })
);

// DELETE /contacts/:id - Supprimer un contact
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.contact.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  })
);

export default router;
