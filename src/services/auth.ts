/**
 * Interface para dados do usuário
 */
export interface UserData {
  email: string
  name?: string
}

/**
 * Armazena dados da sessão no localStorage
 * 
 * @param email - Email do usuário
 */
export function saveSession(email: string): void {
  localStorage.setItem('calculadora_auth_email', email)
  console.log('[Auth] Sessão salva:', email)
}

/**
 * Verifica se há uma sessão válida no localStorage
 * 
 * @returns Email do usuário se a sessão for válida, null caso contrário
 */
export function getValidSession(): string | null {
  try {
    const email = localStorage.getItem('calculadora_auth_email')
    if (!email) {
      return null
    }

    console.log('[Auth] Sessão válida encontrada:', email)
    return email
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
