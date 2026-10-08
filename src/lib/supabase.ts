import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const defaultAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  return {
    url: defaultUrl.trim(),
    anonKey: defaultAnonKey.trim(),
  };
}

export const supabase: SupabaseClient = createClient(defaultUrl, defaultAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function isSupabaseConfigured(): boolean {
  return Boolean(
    defaultUrl &&
    defaultUrl.startsWith('https://') &&
    defaultUrl.includes('.supabase.co') &&
    defaultAnonKey &&
    defaultAnonKey.length > 20
  );
}

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    // In Supabase with RLS, selecting 0 rows with no auth error or permission error still means connection succeeded
    if (error && error.code !== 'PGRST116' && error.code !== '42501') {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Không thể kết nối đến Supabase';
    return { success: false, error: message };
  }
}
