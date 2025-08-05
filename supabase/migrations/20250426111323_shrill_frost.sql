/*
  # Add Birthdate Field
  
  1. Changes
    - Add date_naissance column to contacts table
    - Add date_naissance column to utilisateurs table
*/

-- Add date_naissance column to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS date_naissance date;

-- Add date_naissance column to utilisateurs table
ALTER TABLE utilisateurs 
ADD COLUMN IF NOT EXISTS date_naissance date;

-- Add role column to contacts table for professional contacts
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS role text;