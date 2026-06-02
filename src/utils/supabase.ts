import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxmzewdzytvecjgxzcde.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bXpld2R6eXR2ZWNqZ3h6Y2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjk2MzksImV4cCI6MjA5NTkwNTYzOX0.MdUOn6tgg8xEu8lokvY7wGiLkXHTbttxrXh6N3vJFbU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

