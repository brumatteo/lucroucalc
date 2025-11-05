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
 * Armazena dados da sessão no localStorage com timestamp
 * 
 * @param email - Email do usuário
 */
export function saveSession(email: string): void {
  const sessionData = {
    email: email,
    timestamp: Date.now()
  }
  localStorage.setItem('calculadora_auth_email', JSON.stringify(sessionData))
  console.log('[Auth] Sessão salva:', email)
}

/**
 * Verifica se há uma sessão válida no localStorage e se não expirou
 * 
 * @returns Email do usuário se a sessão for válida e não expirada, null caso contrário
 */
export function getValidSession(): string | null {
  try {
    const sessionStr = localStorage.getItem('calculadora_auth_email')
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
 */
export function clearSession(): void {
  localStorage.removeItem('calculadora_auth_email')
  localStorage.removeItem('sso_session') // Limpar também se existir
  console.log('[Auth] Sessão removida')
}
