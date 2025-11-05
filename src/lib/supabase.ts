import { createClient } from '@supabase/supabase-js'

// Segurança: Credenciais devem vir APENAS de variáveis de ambiente
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Validação obrigatória: sem credenciais, a aplicação não pode funcionar
if (!envUrl || !envAnon) {
  const errorMsg = '[Supabase] ERRO CRÍTICO: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Configure-as no arquivo .env'
  
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error(errorMsg)
    throw new Error(errorMsg)
  } else {
    // Em produção, não expor detalhes, mas também não permitir execução
    throw new Error('Configuração do Supabase ausente')
  }
}

// Validar formato básico das credenciais
if (!envUrl.startsWith('https://') || !envUrl.includes('.supabase.co')) {
  throw new Error('VITE_SUPABASE_URL deve ser uma URL válida do Supabase (https://xxxxx.supabase.co)')
}

if (envAnon.length < 100) {
  throw new Error('VITE_SUPABASE_ANON_KEY parece estar inválida')
}

// StorageKey única para isolamento entre projetos do mesmo domínio
// Usa um hash simples baseado na URL do projeto para garantir unicidade
const getStorageKey = (url: string): string => {
  // Extrai o ID do projeto da URL (ex: vuaogfyrxezhchszmwjz de https://vuaogfyrxezhchszmwjz.supabase.co)
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  const projectId = match ? match[1] : 'default'
  return `lucroucalc_supabase_${projectId}`
}

export const supabase = createClient(envUrl, envAnon, {
  auth: {
    storageKey: getStorageKey(envUrl),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
