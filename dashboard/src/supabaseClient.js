import { createClient } from '@supabase/supabase-js'

// ==============================================================================
// UTILITY: supabaseClient.js
// Purpose: This file initializes the connection to the Supabase database.
// It securely loads the API URL and Anon Key from environment variables (.env).
// How it connects: The exported 'supabase' client is imported by App.jsx 
// and used to query the 'bike_sharing_data' table.
// ==============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
