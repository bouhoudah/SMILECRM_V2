import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Récupérer tous les contrats de test
    const { data: contracts, error: contractsError } = await supabase
      .from('contrats')
      .select('*')
      .eq('donnees_test', true);

    if (contractsError) throw contractsError;

    const historicalData = [];

    // Pour chaque contrat, générer l'historique de 2019 à aujourd'hui
    contracts.forEach(contract => {
      let currentYear = 2019;
      let currentAmount = contract.montant_annuel;

      while (currentYear < 2024) {
        // Augmentation annuelle entre 1% et 5%
        const increase = 1 + (Math.random() * 0.04 + 0.01);
        currentAmount = Math.round(currentAmount / increase);

        historicalData.push({
          contrat_id: contract.id,
          montant_annuel: currentAmount,
          date_debut: `${currentYear}-01-01`,
          date_fin: `${currentYear + 1}-01-01`,
          commission_premiere_annee: contract.commission_premiere_annee,
          commission_annees_suivantes: contract.commission_annees_suivantes,
          frais_dossier: contract.frais_dossier,
          frais_dossier_recurrent: contract.frais_dossier_recurrent,
          created_at: new Date().toISOString(),
          created_by: 'system',
          donnees_test: true
        });

        currentYear++;
      }
    });

    // Insérer l'historique
    const { error: historyError } = await supabase
      .from('contrat_historique')
      .insert(historicalData);

    if (historyError) throw historyError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Historique des contrats créé avec succès',
        count: historicalData.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});