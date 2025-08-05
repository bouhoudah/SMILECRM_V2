import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

// GET /utilisateurs - Récupérer tous les utilisateurs
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('utilisateur')
      .select('*, agence(*), commentaires(*)')
      .order('dateCreation', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  })
);

// GET /utilisateurs/:id - Récupérer un utilisateur par ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('utilisateur')
      .select('*, agence(*), commentaires(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(data);
  })
);

// POST /utilisateurs - Créer un nouvel utilisateur
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('utilisateur')
      .insert([req.body])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json(data[0]);
  })
);

// PUT /utilisateurs/:id - Mettre à jour un utilisateur
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('utilisateur')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.json(data[0]);
  })
);

// DELETE /utilisateurs/:id - Supprimer un utilisateur
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('utilisateur')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });

    res.status(204).end();
  })
);

export default router;
