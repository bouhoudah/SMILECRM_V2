/*
  # Add Documents Table and Relations

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `type` (text)
      - `nom` (text)
      - `url` (text)
      - `telechargeLe` (timestamptz)
      - `statut` (text)
      - `metadonnees` (jsonb)
      - `contactId` (uuid, foreign key)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  nom text NOT NULL,
  url text NOT NULL,
  telechargeLe timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statut text NOT NULL,
  metadonnees jsonb,
  "contactId" uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  donnees_test boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON documents;
    DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON documents;
    DROP POLICY IF EXISTS "Enable update access for authenticated users" ON documents;
    DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON documents;
    DROP POLICY IF EXISTS "Enable service role full access to documents" ON documents;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON documents FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON documents FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON documents FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Enable delete access for authenticated users"
ON documents FOR DELETE TO authenticated
USING (true);

-- Add service role policy
CREATE POLICY "Enable service role full access to documents"
ON documents FOR ALL TO service_role
USING (true)
WITH CHECK (true);