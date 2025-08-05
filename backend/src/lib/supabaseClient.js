// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  throw new Error('❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY manquante dans .env')
}

export const supabase = createClient(url, key)
