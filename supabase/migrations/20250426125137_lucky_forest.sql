/*
  # Add service role policies

  1. Changes
    - Add RLS policies for service role to access all tables
    - Enable service role to perform all operations (SELECT, INSERT, UPDATE, DELETE)
    - Affects tables: contacts, contrats, documents, commentaires, historique, fiches_conseil, contrat_historique

  2. Security
    - Policies specifically target service role operations
    - Maintains existing RLS policies for other roles
*/

-- Contacts table policies
CREATE POLICY "Enable service role full access to contacts"
ON contacts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Contrats table policies
CREATE POLICY "Enable service role full access to contrats"
ON contrats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Documents table policies
CREATE POLICY "Enable service role full access to documents"
ON documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Commentaires table policies
CREATE POLICY "Enable service role full access to commentaires"
ON commentaires
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Historique table policies
CREATE POLICY "Enable service role full access to historique"
ON historique
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fiches conseil table policies
CREATE POLICY "Enable service role full access to fiches_conseil"
ON fiches_conseil
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Contrat historique table policies
CREATE POLICY "Enable service role full access to contrat_historique"
ON contrat_historique
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);