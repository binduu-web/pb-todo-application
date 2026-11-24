import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

const PLACEHOLDER_URLS = [
  'https://your-project-ref.supabase.co',
  'your-supabase-url',
];

const PLACEHOLDER_KEYS = [
  'your-supabase-anon-publishable-key',
  'your-supabase-anon-key',
];

function validateSupabaseConfig(url: string, key: string): string | null {
  if (!url || PLACEHOLDER_URLS.includes(url)) {
    return 'VITE_SUPABASE_URL is not configured in your .env file.';
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return 'VITE_SUPABASE_URL must start with https:// or http://.';
    }
  } catch {
    return 'VITE_SUPABASE_URL is not a valid URL.';
  }

  if (!key || PLACEHOLDER_KEYS.includes(key)) {
    return 'VITE_SUPABASE_ANON_KEY is not configured in your .env file.';
  }

  return null;
}

export const supabaseConfigIssue: string | null = validateSupabaseConfig(
  supabaseUrl,
  supabaseAnonKey
);

export const isSupabaseConfigured: boolean = supabaseConfigIssue === null;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;
