import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const isAscii = (value) => [...value].every((char) => char.charCodeAt(0) <= 127)
const isValidAnonKey = Boolean(supabaseAnonKey && isAscii(supabaseAnonKey) && supabaseAnonKey.startsWith('eyJ'))

export const isSupabaseConfigured = Boolean(supabaseUrl && isValidAnonKey)

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables are missing or invalid.')
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  isValidAnonKey ? supabaseAnonKey : 'missing-anon-key',
)
