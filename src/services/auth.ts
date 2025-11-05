/**
 * Interface para dados do usuário
 */
export interface UserData {
  email: string
  name?: string
}

/**
 * Tempo de expiração da sessão em milissegundos (2 horas)
 */
const SESSION_EXPIRY_TIME = 2 * 60 * 60 * 1000 // 2 horas

/**
 * Chave única para isolamento entre projetos do ecossistema
 * Usa prefixo específico do projeto para evitar conflitos
 */
const STORAGE_KEY_PREFIX = 'lucroucalc_auth'

/**
 * Armazena dados da sessão no localStorage com timestamp
 * Usa chave prefixada para isolamento entre projetos
 * 
 * @param email - Email do usuário
 */
export function saveSession(email: string): void {
  const sessionData = {
    email: email,
    timestamp: Date.now()
  }
  localStorage.setItem(`${STORAGE_KEY_PREFIX}_email`, JSON.stringify(sessionData))
  console.log('[Auth] Sessão salva')
}

/**
 * Verifica se há uma sessão válida no localStorage e se não expirou
 * 
 * @returns Email do usuário se a sessão for válida e não expirada, null caso contrário
 */
export function getValidSession(): string | null {
  try {
    const sessionStr = localStorage.getItem(`${STORAGE_KEY_PREFIX}_email`)
    if (!sessionStr) {
      return null
    }

    // Tentar parsear como JSON (novo formato com timestamp)
    let sessionData
    try {
      sessionData = JSON.parse(sessionStr)
    } catch {
      // Se não for JSON, é o formato antigo (apenas email string)
      // Limpar e retornar null para forçar novo login
      clearSession()
      return null
    }

    // Verificar se tem timestamp
    if (!sessionData.timestamp) {
      // Formato antigo sem timestamp, limpar
      clearSession()
      return null
    }

    // Verificar se a sessão expirou (2 horas)
    const now = Date.now()
    const sessionAge = now - sessionData.timestamp

    if (sessionAge > SESSION_EXPIRY_TIME) {
      console.log('[Auth] Sessão expirada (mais de 2 horas)')
      clearSession()
      return null
    }

    console.log('[Auth] Sessão válida encontrada:', sessionData.email)
    return sessionData.email
  } catch (error) {
    console.error('[Auth] Erro ao ler sessão:', error)
    clearSession()
    return null
  }
}

/**
 * Remove a sessão do localStorage
 * Limpa todas as chaves relacionadas ao projeto para isolamento
 */
export function clearSession(): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}_email`)
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}_sso`) // Limpar também se existir
  // Limpar também chaves antigas para compatibilidade durante migração
  localStorage.removeItem('calculadora_auth_email')
  localStorage.removeItem('sso_session')
  console.log('[Auth] Sessão removida')
}
