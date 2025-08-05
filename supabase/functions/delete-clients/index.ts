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
    // 1. Récupérer tous les contacts qui sont clients
    const { data: clients, error: clientsError } = await supabase
      .from('contacts')
      .select('id')
      .eq('donnees_test', true);

    if (clientsError) {
      console.error('Erreur lors de la récupération des clients:', clientsError);
      throw new Error(`Erreur lors de la récupération des clients: ${clientsError.message}`);
    }

    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Aucun client test à supprimer',
          deletedCount: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const clientIds = clients.map(client => client.id);

    // 2. Supprimer tous les documents associés
    const { error: documentsError } = await supabase
      .from('documents')
      .delete()
      .in('contactId', clientIds);

    if (documentsError) {
      console.error('Erreur lors de la suppression des documents:', documentsError);
      throw new Error(`Erreur lors de la suppression des documents: ${documentsError.message}`);
    }

    // 3. Supprimer tous les commentaires
    const { error: commentairesError } = await supabase
      .from('commentaires')
      .delete()
      .in('contactId', clientIds);

    if (commentairesError) {
      console.error('Erreur lors de la suppression des commentaires:', commentairesError);
      throw new Error(`Erreur lors de la suppression des commentaires: ${commentairesError.message}`);
    }

    // 4. Supprimer l'historique
    const { error: historiqueError } = await supabase
      .from('historique')
      .delete()
      .in('contactId', clientIds);

    if (historiqueError) {
      console.error('Erreur lors de la suppression de l\'historique:', historiqueError);
      throw new Error(`Erreur lors de la suppression de l'historique: ${historiqueError.message}`);
    }

    // 5. Supprimer les fiches conseil
    const { error: fichesConseilError } = await supabase
      .from('fiches_conseil')
      .delete()
      .in('contactId', clientIds);

    if (fichesConseilError) {
      console.error('Erreur lors de la suppression des fiches conseil:', fichesConseilError);
      throw new Error(`Erreur lors de la suppression des fiches conseil: ${fichesConseilError.message}`);
    }

    // 6. Supprimer les contrats
    const { error: contratsError } = await supabase
      .from('contrats')
      .delete()
      .in('contactId', clientIds)
      .eq('donnees_test', true);

    if (contratsError) {
      console.error('Erreur lors de la suppression des contrats:', contratsError);
      throw new Error(`Erreur lors de la suppression des contrats: ${contratsError.message}`);
    }

    // 7. Supprimer l'historique des contrats
    const { error: contratHistoriqueError } = await supabase
      .from('contrat_historique')
      .delete()
      .in('contrat_id', clientIds);

    if (contratHistoriqueError) {
      console.error('Erreur lors de la suppression de l\'historique des contrats:', contratHistoriqueError);
      throw new Error(`Erreur lors de la suppression de l'historique des contrats: ${contratHistoriqueError.message}`);
    }

    // 8. Supprimer les contacts
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .in('id', clientIds)
      .eq('donnees_test', true);

    if (deleteError) {
      console.error('Erreur lors de la suppression des contacts:', deleteError);
      throw new Error(`Erreur lors de la suppression des contacts: ${deleteError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Toutes les données de test ont été supprimées avec succès',
        deletedCount: clients.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de la suppression des données'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});