/*
  # Initial Schema Setup

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text) 
      - `email` (text, unique)
      - `telephone` (text)
      - `types` (jsonb)
      - `statut` (text)
      - `entreprise` (text, nullable)
      - `siret` (text, nullable)
      - `date_creation` (timestamptz)
      - `photo_url` (text, nullable)
      - `portal_access` (jsonb, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `historique_contacts`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key)
      - `date` (timestamptz)
      - `type` (text)
      - `description` (text)
      - `utilisateur_id` (text)
      - `created_at` (timestamptz)

    - `commentaires_contacts`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key)
      - `date` (timestamptz)
      - `type` (text)
      - `sujet` (text)
      - `contenu` (text)
      - `utilisateur_id` (text)
      - `created_at` (timestamptz)

    - `partenaires`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `type` (text)
      - `produits` (text[])
      - `statut` (text)
      - `contact_principal` (text)
      - `email` (text)
      - `telephone` (text)
      - `site_web` (text, nullable)
      - `intranet_url` (text, nullable)
      - `logo_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `contrats`
      - `id` (uuid, primary key)
      - `reference` (text, unique)
      - `client_id` (uuid, foreign key)
      - `type` (text)
      - `categorie` (text)
      - `statut` (text)
      - `montant_annuel` (numeric)
      - `date_debut` (date)
      - `date_fin` (date)
      - `partenaire` (text)
      - `commission_premiere_annee` (numeric)
      - `commission_annees_suivantes` (numeric)
      - `frais_dossier` (numeric)
      - `frais_dossier_recurrent` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts table
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text UNIQUE NOT NULL,
  telephone text NOT NULL,
  types jsonb NOT NULL DEFAULT '{"particulier": false, "professionnel": false}',
  statut text NOT NULL CHECK (statut IN ('prospect', 'client')),
  entreprise text,
  siret text,
  date_creation timestamptz NOT NULL DEFAULT now(),
  photo_url text,
  portal_access jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Historique contacts table
CREATE TABLE historique_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  date timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('creation', 'modification', 'ajout_type', 'suppression_type', 'modification_statut', 'nouveau_contrat', 'resiliation_contrat')),
  description text NOT NULL,
  utilisateur_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Commentaires contacts table
CREATE TABLE commentaires_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  date timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('appel_entrant', 'appel_sortant', 'email_recu', 'email_envoye', 'autre')),
  sujet text NOT NULL CHECK (sujet IN ('demande_info', 'sinistre', 'reclamation', 'commercial', 'autre')),
  contenu text NOT NULL,
  utilisateur_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Partenaires table
CREATE TABLE partenaires (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  type text NOT NULL CHECK (type IN ('assureur', 'courtier grossiste')),
  produits text[] NOT NULL,
  statut text NOT NULL CHECK (statut IN ('actif', 'inactif')),
  contact_principal text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  site_web text,
  intranet_url text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contrats table
CREATE TABLE contrats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference text UNIQUE NOT NULL,
  client_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('auto', 'habitation', 'santé', 'prévoyance', 'multirisque', 'responsabilité civile')),
  categorie text NOT NULL CHECK (categorie IN ('particulier', 'professionnel')),
  statut text NOT NULL CHECK (statut IN ('actif', 'en_cours', 'résilié', 'à_renouveler')),
  montant_annuel numeric NOT NULL,
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  partenaire text NOT NULL,
  commission_premiere_annee numeric NOT NULL,
  commission_annees_suivantes numeric NOT NULL,
  frais_dossier numeric NOT NULL,
  frais_dossier_recurrent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partenaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE contrats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON contacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON contacts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON contacts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON contacts
  FOR DELETE TO authenticated USING (true);

-- Repeat similar policies for other tables
CREATE POLICY "Enable read access for authenticated users" ON historique_contacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON historique_contacts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON commentaires_contacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON commentaires_contacts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON partenaires
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON partenaires
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON partenaires
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON partenaires
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON contrats
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON contrats
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON contrats
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON contrats
  FOR DELETE TO authenticated USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_partenaires_updated_at
  BEFORE UPDATE ON partenaires
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_contrats_updated_at
  BEFORE UPDATE ON contrats
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();