import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { supabase } from '../lib/supabaseClient.js';

const prisma = new PrismaClient();
const router = express.Router();

function sanitizeFileName(filename) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    const { type, statut, contactId, metadonnees, utilisateurId } = req.body;

    console.log('📥 Fichier reçu par Multer :');
    console.log(file);

    if (!file || !contactId || !type || !statut || !utilisateurId) {
      return res.status(400).json({ error: 'Champs manquants (contactId, utilisateurId, etc.)' });
    }

    const userExists = await prisma.utilisateur.findUnique({
      where: { id: parseInt(utilisateurId) }
    });

    if (!userExists) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const sanitizedName = sanitizeFileName(file.originalname);
    const filePath = `contact_${contactId}/${Date.now()}_${sanitizedName}`;

    // 🟢 Upload du fichier dans Supabase
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Erreur Supabase :', uploadError.message);
      return res.status(500).json({ error: 'Erreur upload Supabase' });
    }

    // 🟢 Obtenir l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 🟢 Enregistrer dans la base
    const document = await prisma.document.create({
      data: {
        type,
        nom: file.originalname,
        url: filePath, // <-- clé ici
        statut,
        contactId: parseInt(contactId),
        metadonnees: metadonnees ? JSON.parse(metadonnees) : undefined,
      }
    });


    await prisma.historique.create({
      data: {
        type: 'upload',
        description: `Upload du document ${file.originalname}`,
        contact: { connect: { id: parseInt(contactId) } },
        utilisateur: { connect: { id: parseInt(utilisateurId) } },
      }
    });

    res.status(201).json({ message: 'Document uploadé', document });
  } catch (error) {
    console.error('❌ Erreur serveur :', error);
    next(error);
  }
});

// ✅ GET /api/documents/signed-url/:path
// /routes/documents.js
router.get('/signed-url/:path', async (req, res) => {
  try {
    const rawPath = decodeURIComponent(req.params.path); // important
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(rawPath, 60); // valide 60s

    if (error) {
      console.error("❌ Erreur URL signée :", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ url: data.signedUrl });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



export default router;
