import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

// Browser & Node environment compatible environment variable extraction
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as Record<string, any>).env : undefined;

const supabaseUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://placeholder-project.supabase.co';

const supabaseAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

/**
 * Singleton Supabase Client typed with the project's PostgreSQL schema.
 * Operates under the user's Row Level Security context.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Creates an admin client with service_role key for trusted server-side executions only.
 * Throws immediately if invoked in a browser environment without the secret key.
 */
export function createAdminClient(serviceRoleKey?: string): SupabaseClient<Database> {
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to initialize an administrative Supabase client.');
  }
  return createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
