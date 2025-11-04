import { jwtVerify } from 'jose'

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
 * Obtém a chave secreta do ambiente
 */
const getSecretKey = (): string => {
  const secretKey = import.meta.env.VITE_APP_SECRET_KEY
  if (!secretKey) {
    throw new Error('VITE_APP_SECRET_KEY não está configurada nas variáveis de ambiente')
  }
  return secretKey
}

/**
 * Converte a chave secreta em formato para Web Crypto API
 */
const getSecretKeyForCrypto = async (): Promise<Uint8Array> => {
  const secretKey = getSecretKey()
  const encoder = new TextEncoder()
  return encoder.encode(secretKey)
}

/**
 * Valida um token JWT e retorna os dados do usuário se válido
 * 
 * @param token - Token JWT a ser validado
 * @returns Resultado da validação com dados do usuário ou erro
 */
export async function validateToken(token: string): Promise<TokenValidationResult> {
  try {
    console.log('[SSO] Iniciando validação de token...')
    
    if (!token || token.trim() === '') {
      console.error('[SSO] Token vazio ou inválido')
      return {
        valid: false,
        error: 'Token não fornecido'
      }
    }

    // Obter a chave secreta
    const secretKey = await getSecretKeyForCrypto()

    // Verificar e decodificar o token
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256']
    })

    console.log('[SSO] Token decodificado com sucesso:', payload)

    // Extrair dados do usuário do payload
    const email = payload.email as string
    const name = payload.name as string

    // Verificar se email e nome estão presentes
    if (!email || !name) {
      console.error('[SSO] Token inválido: faltam dados do usuário (email ou name)')
      return {
        valid: false,
        error: 'Token inválido: faltam dados do usuário'
      }
    }

    // Verificar expiração do token (já verificado pelo jwtVerify, mas vamos garantir)
    const exp = payload.exp as number
    if (exp && Date.now() >= exp * 1000) {
      console.error('[SSO] Token expirado')
      return {
        valid: false,
        error: 'Token expirado'
      }
    }

    console.log('[SSO] Token recebido: válido')
    console.log('[SSO] Dados do usuário:', { email, name })

    return {
      valid: true,
      userData: {
        email: email.toLowerCase().trim(),
        name: name.trim()
      }
    }
  } catch (error: any) {
    console.error('[SSO] Token inválido:', error.message)
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Token inválido'
    if (error.code === 'ERR_JWT_EXPIRED') {
      errorMessage = 'Token expirado'
    } else if (error.code === 'ERR_JWT_INVALID') {
      errorMessage = 'Token inválido ou malformado'
    } else if (error.message?.includes('VITE_APP_SECRET_KEY')) {
      errorMessage = 'Chave secreta não configurada'
    }

    return {
      valid: false,
      error: errorMessage
    }
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

