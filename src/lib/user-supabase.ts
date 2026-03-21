import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for a client's own project.
 * Uses the service role key so all tables are accessible (no RLS).
 */
export function createUserSupabase(url: string, serviceKey: string): SupabaseClient {
  return createClient(url, serviceKey)
}
