/**
 * Interface para dados do usuário extraídos do token
 */
export interface TokenUserData {
  email: string
  name: string
}

/**
 * Interface para resposta da validação do token
 */
export interface TokenValidationResult {
  valid: boolean
  userData?: TokenUserData
  error?: string
}

/**
 * Valida um token JWT e retorna os dados do usuário se válido
 * 
 * @param token - Token JWT a ser validado
 * @returns Resultado da validação com dados do usuário ou erro
 * @deprecated Esta função será substituída pela validação via parâmetro de URL (?auth=email)
 */
export async function validateToken(token: string): Promise<TokenValidationResult> {
  console.warn('[SSO] validateToken está deprecated. Use validação via parâmetro de URL (?auth=email)')
  
  return {
    valid: false,
    error: 'Validação de token via JWT foi removida. Use validação via parâmetro de URL.'
  }
}

/**
 * Armazena dados da sessão no localStorage
 * 
 * @param userData - Dados do usuário
 */
export function saveSession(userData: TokenUserData): void {
  const sessionData = {
    email: userData.email,
    name: userData.name,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas em milissegundos
  }
  
  localStorage.setItem('sso_session', JSON.stringify(sessionData))
  localStorage.setItem('calculadora_auth_email', userData.email)
  
  console.log('[SSO] Sessão salva:', userData.email)
}

/**
 * Verifica se há uma sessão válida no localStorage
 * 
 * @returns Dados do usuário se a sessão for válida, null caso contrário
 */
export function getValidSession(): TokenUserData | null {
  try {
    const sessionStr = localStorage.getItem('sso_session')
    if (!sessionStr) {
      return null
    }

    const sessionData = JSON.parse(sessionStr)
    
    // Verificar se a sessão expirou
    if (Date.now() >= sessionData.expiresAt) {
      console.log('[SSO] Sessão expirada')
      clearSession()
      return null
    }

    console.log('[SSO] Sessão válida encontrada:', sessionData.email)
    return {
      email: sessionData.email,
      name: sessionData.name
    }
  } catch (error) {
    console.error('[SSO] Erro ao ler sessão:', error)
    clearSession()
    return null
  }
}

/**
 * Remove a sessão do localStorage
 */
export function clearSession(): void {
  localStorage.removeItem('sso_session')
  localStorage.removeItem('calculadora_auth_email')
  console.log('[SSO] Sessão removida')
}

