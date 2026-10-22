// src/core/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Debugging: Check your browser console to see what is printing
console.log("URL Loaded:", supabaseUrl)
console.log("Key Loaded:", supabaseKey ? "Yes (Hidden for security)" : "No")

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase env vars. Check .env.local")
}

export const supabase = createClient(supabaseUrl, supabaseKey)