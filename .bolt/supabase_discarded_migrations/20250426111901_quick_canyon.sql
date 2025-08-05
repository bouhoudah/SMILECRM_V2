/*
  # Add Insurance Brokers
  
  1. Changes
    - Add new insurance brokers from Dispofi
    - Set misAJourLe to current timestamp
*/

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
    true
  );