import { createClient } from '@supabase/supabase-js';

// Reads strictly from environment variables (.env) - NEVER hardcoded in frontend source
const envUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const envKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(envUrl && envKey && !envUrl.includes('your-project') && !envKey.includes('your-anon'));
};

if (!isSupabaseConfigured()) {
  console.warn(
    'PrismFlow: Supabase credentials are not set in your .env file. Please ensure VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and key are provided in .env.'
  );
}

// Single reusable Supabase client instance using environment variables
export const supabase = createClient(
  envUrl || 'https://placeholder.supabase.co',
  envKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
