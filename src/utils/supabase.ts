import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxmzewdzytvecjgxzcde.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9qZg4Lgzw7Q6M3Bs5_DgpQ_hQzzK7b8S3S2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
