/*
  # Add Test Data Support
  
  1. Changes
    - Add donnees_test boolean column to all tables
    - Add table existence checks before modifications
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add donnees_test column to existing tables if it doesn't exist
DO $$ 
BEGIN
  -- Check if table exists before attempting to add column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'contacts'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'donnees_test'
    ) THEN
      ALTER TABLE contacts ADD COLUMN donnees_test boolean NOT NULL DEFAULT false;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'historique_contacts'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'historique_contacts' AND column_name = 'donnees_test'
    ) THEN
      ALTER TABLE historique_contacts ADD COLUMN donnees_test boolean NOT NULL DEFAULT false;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'commentaires_contacts'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'commentaires_contacts' AND column_name = 'donnees_test'
    ) THEN
      ALTER TABLE commentaires_contacts ADD COLUMN donnees_test boolean NOT NULL DEFAULT false;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'partenaires'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'partenaires' AND column_name = 'donnees_test'
    ) THEN
      ALTER TABLE partenaires ADD COLUMN donnees_test boolean NOT NULL DEFAULT false;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'contrats'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'contrats' AND column_name = 'donnees_test'
    ) THEN
      ALTER TABLE contrats ADD COLUMN donnees_test boolean NOT NULL DEFAULT false;
    END IF;
  END IF;
END $$;

-- Create or update policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist and table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contacts;
    DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON contacts;
    DROP POLICY IF EXISTS "Enable update access for authenticated users" ON contacts;
    DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON contacts;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historique_contacts') THEN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON historique_contacts;
    DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON historique_contacts;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commentaires_contacts') THEN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON commentaires_contacts;
    DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON commentaires_contacts;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partenaires') THEN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON partenaires;
    DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON partenaires;
    DROP POLICY IF EXISTS "Enable update access for authenticated users" ON partenaires;
    DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON partenaires;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contrats') THEN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contrats;
    DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON contrats;
    DROP POLICY IF EXISTS "Enable update access for authenticated users" ON contrats;
    DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON contrats;
  END IF;
END $$;

-- Create new policies only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
    CREATE POLICY "Enable read access for authenticated users" ON contacts
      FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Enable insert access for authenticated users" ON contacts
      FOR INSERT TO authenticated WITH CHECK (true);

    CREATE POLICY "Enable update access for authenticated users" ON contacts
      FOR UPDATE TO authenticated USING (true);

    CREATE POLICY "Enable delete access for authenticated users" ON contacts
      FOR DELETE TO authenticated USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historique_contacts') THEN
    CREATE POLICY "Enable read access for authenticated users" ON historique_contacts
      FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Enable insert access for authenticated users" ON historique_contacts
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commentaires_contacts') THEN
    CREATE POLICY "Enable read access for authenticated users" ON commentaires_contacts
      FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Enable insert access for authenticated users" ON commentaires_contacts
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partenaires') THEN
    CREATE POLICY "Enable read access for authenticated users" ON partenaires
      FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Enable insert access for authenticated users" ON partenaires
      FOR INSERT TO authenticated WITH CHECK (true);

    CREATE POLICY "Enable update access for authenticated users" ON partenaires
      FOR UPDATE TO authenticated USING (true);

    CREATE POLICY "Enable delete access for authenticated users" ON partenaires
      FOR DELETE TO authenticated USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contrats') THEN
    CREATE POLICY "Enable read access for authenticated users" ON contrats
      FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Enable insert access for authenticated users" ON contrats
      FOR INSERT TO authenticated WITH CHECK (true);

    CREATE POLICY "Enable update access for authenticated users" ON contrats
      FOR UPDATE TO authenticated USING (true);

    CREATE POLICY "Enable delete access for authenticated users" ON contrats
      FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate triggers only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
    DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
    CREATE TRIGGER update_contacts_updated_at
      BEFORE UPDATE ON contacts
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partenaires') THEN
    DROP TRIGGER IF EXISTS update_partenaires_updated_at ON partenaires;
    CREATE TRIGGER update_partenaires_updated_at
      BEFORE UPDATE ON partenaires
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contrats') THEN
    DROP TRIGGER IF EXISTS update_contrats_updated_at ON contrats;
    CREATE TRIGGER update_contrats_updated_at
      BEFORE UPDATE ON contrats
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;