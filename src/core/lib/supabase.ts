// src/core/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// TEMPORARY fallback — remove once Vercel env vars work
const FALLBACK_URL = 'https://lzsqdfgehecnetcauywy.supabase.co';
const FALLBACK_KEY = 'sb_publishable_h3T6vZzr9Uwnm6p3PvsZRw_C1Ls7Ufp';

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
