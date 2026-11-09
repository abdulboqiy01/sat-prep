import { createClient } from 'npm:@supabase/supabase-js@2';

export function getSupabaseUserClient(authHeader: string | null) {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: authHeader || '',
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

export function getSupabaseAdminClient() {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Edge Function execution.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
