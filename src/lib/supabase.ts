import { createClient } from '@supabase/supabase-js'

// Prefer Vite env vars; fallback to hardcoded values only if envs are missing
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const supabaseUrl = envUrl ?? 'https://vuaogfyrxezhchszmwjz.supabase.co'
const supabaseAnonKey = envAnon ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YW9nZnlyeGV6aGNoc3ptd2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODgzMzksImV4cCI6MjA3NjU2NDMzOX0.4HRS9G4RlEjhr1IZ4qJ0sr1-o7t5_jdihu47sDGLb18'

if (!envUrl || !envAnon) {
  // Log apenas em dev para lembrar de configurar .env
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('[Supabase] Usando credenciais de fallback. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
