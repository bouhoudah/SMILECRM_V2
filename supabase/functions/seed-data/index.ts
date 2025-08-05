import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Génération des données de test
const generateTestData = () => {
  const contacts = [];
  const prospects = [];
  const clients = [];
  const contracts = [];

  // Génération de 20 prospects
  for (let i = 0; i < 20; i++) {
    prospects.push({
      nom: `Prospect${i}`,
      prenom: `Test${i}`,
      email: `prospect${i}@test.com`,
      telephone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      types: { particulier: true, professionnel: false },
      statut: 'prospect',
      donnees_test: true
    });
  }

  // Génération de 10 clients particuliers
  for (let i = 0; i < 10; i++) {
    clients.push({
      nom: `ClientPart${i}`,
      prenom: `Test${i}`,
      email: `clientpart${i}@test.com`,
      telephone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      types: { particulier: true, professionnel: false },
      statut: 'client',
      donnees_test: true
    });
  }

  // Génération de 5 clients professionnels
  for (let i = 0; i < 5; i++) {
    clients.push({
      nom: `ClientPro${i}`,
      prenom: `Test${i}`,
      email: `clientpro${i}@test.com`,
      telephone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      types: { particulier: false, professionnel: true },
      statut: 'client',
      entreprise: `Entreprise Test ${i}`,
      siret: String(Math.floor(Math.random() * 100000000000000)).padStart(14, '0'),
      donnees_test: true
    });
  }

  // Génération de 5 clients hybrides
  for (let i = 0; i < 5; i++) {
    clients.push({
      nom: `ClientHybrid${i}`,
      prenom: `Test${i}`,
      email: `clienthybrid${i}@test.com`,
      telephone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      types: { particulier: true, professionnel: true },
      statut: 'client',
      entreprise: `Entreprise Hybride ${i}`,
      siret: String(Math.floor(Math.random() * 100000000000000)).padStart(14, '0'),
      donnees_test: true
    });
  }

  contacts.push(...prospects, ...clients);
  return { contacts, contracts };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { contacts, contracts } = generateTestData();

    // Insertion des contacts
    const { data: insertedContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(contacts)
      .select();

    if (contactsError) throw contactsError;

    // Pour chaque client, générer 2-5 contrats
    const contractsToInsert = [];
    insertedContacts
      .filter(contact => contact.statut === 'client')
      .forEach(client => {
        const numContracts = Math.floor(Math.random() * 4) + 2; // 2-5 contrats
        
        for (let i = 0; i < numContracts; i++) {
          const startYear = 2019;
          const startDate = new Date(startYear, 0, 1);
          const endDate = new Date(startYear + 1, 0, 1);

          contractsToInsert.push({
            reference: `CONT-${startYear}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            client_id: client.id,
            type: ['auto', 'habitation', 'santé', 'prévoyance', 'multirisque', 'responsabilité civile'][Math.floor(Math.random() * 6)],
            categorie: client.types.professionnel ? 'professionnel' : 'particulier',
            statut: 'actif',
            montant_annuel: Math.floor(Math.random() * 3000) + 500,
            date_debut: startDate.toISOString(),
            date_fin: endDate.toISOString(),
            partenaire: ['AXA', 'Allianz', 'MAAF'][Math.floor(Math.random() * 3)],
            commission_premiere_annee: Math.floor(Math.random() * 15) + 25,
            commission_annees_suivantes: Math.floor(Math.random() * 10) + 5,
            frais_dossier: Math.floor(Math.random() * 150) + 50,
            frais_dossier_recurrent: Math.random() > 0.7,
            donnees_test: true
          });
        }
      });

    // Insertion des contrats
    const { error: contractsError } = await supabase
      .from('contrats')
      .insert(contractsToInsert);

    if (contractsError) throw contractsError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Données de test insérées avec succès',
        count: {
          contacts: contacts.length,
          contracts: contractsToInsert.length
        }
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