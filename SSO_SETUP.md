# 🔐 Configuração SSO (Single Sign-On)

## Visão Geral

A Calculadora Caseirinhos (lucrocalc) agora aceita login via token SSO simples do Plano Interativo Caseirinhos.

## Funcionalidades

✅ **Login automático via token**: Quando o Plano envia um token válido na URL (`?token=...`), o login é feito automaticamente  
✅ **Sessão de 24 horas**: Após login via token, a sessão dura 24 horas  
✅ **Validação de segurança**: Apenas tokens assinados com `VITE_APP_SECRET_KEY` são aceitos  
✅ **Compatibilidade**: Mantém o fluxo de login normal (via email) funcionando  

## Configuração

### 1. Variável de Ambiente

Adicione a chave secreta no arquivo `.env`:

```env
VITE_APP_SECRET_KEY=sua-chave-secreta-aqui-mínimo-32-caracteres
```

**Importante**: Use uma chave secreta forte e aleatória. Recomendado: mínimo de 32 caracteres.

### 2. Geração de Chave Secreta

Você pode gerar uma chave secreta usando:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou online em: https://randomkeygen.com/
```

### 3. Formato do Token JWT

O token deve ser um JWT assinado com HS256 contendo:

```json
{
  "email": "usuario@email.com",
  "name": "Nome da Usuária",
  "exp": 1234567890  // Expiração (Unix timestamp)
}
```

**Nota**: O token expira em 1 minuto (apenas para login inicial). Após login, a sessão dura 24 horas.

## Como Funciona

### Fluxo de Login SSO

1. **Plano Interativo** envia o usuário para a Calculadora com token na URL:
   ```
   https://calculadora.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Calculadora** detecta o token na URL e:
   - Valida a assinatura usando `VITE_APP_SECRET_KEY`
   - Decodifica o token e extrai email e nome
   - Salva a sessão no localStorage (24 horas)
   - Remove o token da URL (segurança)
   - Redireciona para o Dashboard

3. **Sessão** é validada automaticamente:
   - Ao carregar a página
   - Periodicamente (a cada 5 minutos)
   - Se expirar, redireciona para login

### Fluxo de Login Normal

Se não houver token na URL:
1. Mostra tela de login normal
2. Usuário digita email
3. Sistema valida via Supabase
4. Salva sessão

## Logs de Debug

O sistema registra logs no console para facilitar debug:

- `[SSO] Token encontrado na URL` - Token detectado na URL
- `[SSO] Token recebido: válido` - Token validado com sucesso
- `[SSO] Token inválido: [erro]` - Token inválido ou expirado
- `[SSO] Sessão válida encontrada` - Sessão encontrada no localStorage
- `[SSO] Sessão expirada` - Sessão expirou

## Segurança

- ✅ Apenas tokens assinados com `VITE_APP_SECRET_KEY` são aceitos
- ✅ Token é removido da URL após processamento
- ✅ Sessão expira após 24 horas
- ✅ Validação periódica de expiração
- ✅ Tokens expirados são rejeitados automaticamente

## Exemplo de Uso

### No Plano Interativo (geração do token)

```javascript
import { SignJWT } from 'jose'

// Gerar token para login SSO
const secretKey = new TextEncoder().encode(process.env.APP_SECRET_KEY)

const token = await new SignJWT({
  email: user.email,
  name: user.name
})
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('1m') // Token expira em 1 minuto
  .sign(secretKey)

// Redirecionar para Calculadora
window.location.href = `https://calculadora.com/?token=${token}`
```

### Teste Manual

Para testar manualmente, você pode gerar um token usando Node.js:

```javascript
const { SignJWT } = require('jose')

const secretKey = new TextEncoder().encode('sua-chave-secreta-aqui')

const token = await new SignJWT({
  email: 'teste@email.com',
  name: 'Usuária Teste'
})
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('1m')
  .sign(secretKey)

console.log('Token:', token)
// Use: https://calculadora.com/?token=SEU_TOKEN_AQUI
```

## Troubleshooting

### Token inválido

- Verifique se `VITE_APP_SECRET_KEY` está configurada corretamente
- Verifique se a chave usada para assinar o token é a mesma
- Verifique se o token não expirou (expira em 1 minuto)

### Sessão não persiste

- Verifique se o localStorage está habilitado
- Verifique se não há bloqueadores de cookies/localStorage
- Verifique os logs no console para mais detalhes

### Token válido mas não faz login

- Verifique os logs no console do navegador
- Verifique se o token contém `email` e `name` no payload
- Verifique se o algoritmo de assinatura é HS256

