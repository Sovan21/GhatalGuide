/**
 * ⚠️ IMPORTANT: This client uses the PUBLIC anon key — NOT a service_role key.
 * It has the SAME permissions as the regular supabaseClient.
 * The only difference is a separate auth storage key ('sb-admin-auth-token') 
 * to prevent admin and regular user session conflicts in the same browser.
 * 
 * Real admin security MUST be enforced via Supabase RLS (Row Level Security) policies.
 * This client does NOT bypass RLS or grant any elevated privileges.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-admin-auth-token',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
