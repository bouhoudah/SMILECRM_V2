import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Fonction pour insérer les données de test
export const insertTestData = async () => {
  try {
    // 1. Supprimer les données existantes
    const deleteResponse = await fetch(
      `${supabaseUrl}/functions/v1/delete-clients`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression des données');
    }

    // 2. Insérer les nouvelles données
    const seedResponse = await fetch(
      `${supabaseUrl}/functions/v1/seed-data`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!seedResponse.ok) {
      const errorData = await seedResponse.json();
      throw new Error(errorData.error || 'Erreur lors de l\'insertion des données');
    }

    // 3. Ajouter l'historique des contrats
    const historyResponse = await fetch(
      `${supabaseUrl}/functions/v1/historical-contracts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!historyResponse.ok) {
      const errorData = await historyResponse.json();
      throw new Error(errorData.error || 'Erreur lors de l\'ajout de l\'historique');
    }

    console.log('Données de test insérées avec succès');
    return true;
  } catch (error) {
    console.error('Erreur détaillée:', error);
    throw error;
  }
};

export default supabase;