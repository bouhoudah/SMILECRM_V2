/*
  # Add Contract History Tracking

  1. New Tables
    - `contrat_historique`
      - `id` (integer, primary key)
      - `contrat_id` (integer, foreign key)
      - `montant_annuel` (numeric)
      - `date_debut` (date)
      - `date_fin` (date)
      - `commission_premiere_annee` (numeric)
      - `commission_annees_suivantes` (numeric)
      - `frais_dossier` (numeric)
      - `frais_dossier_recurrent` (boolean)
      - `created_at` (timestamptz)
      - `created_by` (text)

  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users

  3. Changes
    - Add notification_sent boolean to contrats table for renewal alerts
*/

-- Create contract history table
CREATE TABLE contrat_historique (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  contrat_id integer NOT NULL REFERENCES contrats(id) ON DELETE CASCADE,
  montant_annuel numeric NOT NULL,
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  commission_premiere_annee numeric NOT NULL,
  commission_annees_suivantes numeric NOT NULL,
  frais_dossier numeric NOT NULL,
  frais_dossier_recurrent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL
);

-- Add notification field to contracts
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS notification_sent boolean NOT NULL DEFAULT false;

-- Enable RLS
ALTER TABLE contrat_historique ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON contrat_historique
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON contrat_historique
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to check contracts needing renewal
CREATE OR REPLACE FUNCTION check_contracts_for_renewal()
RETURNS TABLE (
  contract_id integer,
  reference text,
  client_name text,
  end_date date,
  days_until_renewal integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as contract_id,
    c.reference,
    concat(co.prenom, ' ', co.nom) as client_name,
    c.date_fin as end_date,
    (c.date_fin - CURRENT_DATE) as days_until_renewal
  FROM contrats c
  JOIN contacts co ON c.client_id = co.id
  WHERE 
    c.statut = 'actif' 
    AND c.date_fin > CURRENT_DATE
    AND c.date_fin <= (CURRENT_DATE + interval '30 days')
    AND NOT c.notification_sent;
END;
$$ LANGUAGE plpgsql;