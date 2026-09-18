// src/core/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// TEMPORARY fallback — remove once Vercel env vars work
const FALLBACK_URL = 'PASTE_YOUR_SUPABASE_URL_HERE';
const FALLBACK_KEY = 'PASTE_YOUR_PUBLISHABLE_KEY_HERE';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;

if (!supabaseUrl || supabaseUrl.includes('PASTE_YOUR')) {
  throw new Error('Missing Supabase URL');
}
if (!supabaseKey || supabaseKey.includes('PASTE_YOUR')) {
  throw new Error('Missing Supabase key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
