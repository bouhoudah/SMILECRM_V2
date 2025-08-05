/*
  # Add Test Partners

  1. Changes
    - Add default agency if it doesn't exist
    - Add test partners with proper data structure
    
  2. Notes
    - All partners are marked as test data
    - Partners are linked to the default agency
*/

-- First create the default agency if it doesn't exist
INSERT INTO agences (
  id,
  nom,
  adresse,
  siren,
  statut,
  "creeLe",
  "creePar",
  "misAJourLe"
) 
SELECT 
  1,
  'Agence Principale',
  '123 Avenue des Assurances, 75001 Paris',
  '123456789',
  'active',
  CURRENT_TIMESTAMP,
  'system',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM agences WHERE id = 1
);

-- Then insert partners
INSERT INTO partenaires (
  nom,
  type,
  produits,
  statut,
  "contactPrincipal",
  email,
  telephone,
  "siteWeb",
  "misAJourLe",
  "agenceId",
  donnees_test
) VALUES
  (
    'April Entreprise',
    'courtier grossiste',
    ARRAY['santé collective', 'prévoyance collective'],
    'actif',
    'Service Commercial',
    'contact@april-entreprise.fr',
    '0974757575',
    'https://www.april.fr',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Apivia',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance'],
    'actif',
    'Service Commercial',
    'contact@apivia.fr',
    '0974757575',
    'https://www.apivia.fr',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Aviva Solutions',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance', 'retraite'],
    'actif',
    'Service Commercial',
    'contact@aviva.fr',
    '0974757575',
    'https://www.aviva.fr',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Entoria',
    'courtier grossiste',
    ARRAY['santé collective', 'prévoyance collective', 'retraite collective'],
    'actif',
    'Service Commercial',
    'contact@entoria.fr',
    '0974757575',
    'https://www.entoria.fr',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Henner',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance', 'retraite'],
    'actif',
    'Service Commercial',
    'contact@henner.fr',
    '0974757575',
    'https://www.henner.com',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Malakoff Humanis',
    'courtier grossiste',
    ARRAY['santé collective', 'prévoyance collective', 'retraite collective'],
    'actif',
    'Service Commercial',
    'contact@malakoffhumanis.fr',
    '0974757575',
    'https://www.malakoffhumanis.com',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Mercer',
    'courtier grossiste',
    ARRAY['santé collective', 'prévoyance collective', 'retraite collective'],
    'actif',
    'Service Commercial',
    'contact@mercer.fr',
    '0974757575',
    'https://www.mercer.fr',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Solly Azar',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance', 'auto', 'habitation'],
    'actif',
    'Service Commercial',
    'contact@sollyazar.fr',
    '0974757575',
    'https://www.sollyazar.com',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'SPVie',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance', 'retraite'],
    'actif',
    'Service Commercial',
    'contact@spvie.fr',
    '0974757575',
    'https://www.spvie.com',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Swiss Life',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance', 'retraite'],
    'actif',
    'Service Commercial',
    'contact@swisslife.fr',
    '0974757575',
    'https://www.swisslife.fr',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Alptis',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance'],
    'actif',
    'Service Commercial',
    'contact@alptis.fr',
    '0974757575',
    'https://www.alptis.org',
    CURRENT_TIMESTAMP,
    1,
    true
  ),
  (
    'Generali',
    'courtier grossiste',
    ARRAY['santé', 'prévoyance', 'retraite', 'auto', 'habitation'],
    'actif',
    'Service Commercial',
    'contact@generali.fr',
    '0974757575',
    'https://www.generali.fr',
    CURRENT_TIMESTAMP,
    1,
    true
  );