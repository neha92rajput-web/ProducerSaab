import { createClient } from '@supabase/supabase-js';

// Hardcoding the connection strings directly bypasses framework environment blockers
const supabaseUrl = 'https://zxmzewdzytvecjgxzcde.supabase.co';
const supabaseAnonKey = 'sb_publishable_9qZg4Lgzw7Q6M3Bs5_DgpQ_hQzzK7b8S3S2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
