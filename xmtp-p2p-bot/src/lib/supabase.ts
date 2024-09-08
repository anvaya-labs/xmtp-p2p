import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase.types';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or key');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
