import { createClient } from '@supabase/supabase-js';

// This checks every possible combination (Next.js, Vite, Lovable, and Hardcoded)
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  'https://zxmzewdzytvecjgxzcde.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  'sb_publishable_9qZg4Lgzw7Q6M3Bs5_DgpQ_hQzzK7b8S3S2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
