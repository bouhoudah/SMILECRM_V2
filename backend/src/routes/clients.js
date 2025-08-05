import { Router } from 'express';
const router = Router();

// GET all clients
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST new client
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ error: 'Les champs name et email sont requis' });
  }

  const { data: existingClient } = await supabase
    .from('client')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existingClient) {
    return res
      .status(409)
      .json({ error: 'Un client avec cet email existe déjà' });
  }

  const { data, error } = await supabase
    .from('client')
    .insert({ name, email })
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

export default router;
