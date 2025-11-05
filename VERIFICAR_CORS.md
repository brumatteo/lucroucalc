# 🔍 Como Verificar e Corrigir Erros de CORS no Supabase

## 🎯 Objetivo

Verificar se o problema de conexão é relacionado a CORS (Cross-Origin Resource Sharing).

## 🧪 Passo 1: Testar no Console do Navegador

1. Abra o Console do Navegador (F12)
2. Cole e execute este código:

```javascript
// ⚠️ IMPORTANTE: Substitua pelos valores do seu arquivo .env
// NUNCA exponha credenciais reais em documentação
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

fetch(`${SUPABASE_URL}/rest/v1/users_hub?select=*&limit=1`, {
  method: 'GET',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(response => {
  console.log('✅ Status:', response.status);
  console.log('✅ Headers:', response.headers);
  return response.json();
})
.then(data => console.log('✅ Dados:', data))
.catch(error => {
  console.error('❌ Erro:', error);
  console.error('❌ É CORS?', error.message.includes('CORS') || error.message.includes('Access-Control'));
});
```

### Resultados Possíveis:

#### ✅ Se funcionar:
- A conexão está OK, problema está no código da aplicação
- Verifique se há algum proxy ou configuração de rede

#### ❌ Se der erro CORS:
```
Access to fetch at '...' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Solução:** O Supabase está bloqueando requisições do localhost

## 🔧 Como Configurar CORS no Supabase (se necessário)

### Opção 1: Configurar no Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Na seção **Project URL**, verifique se está configurado para aceitar requisições de:
   - `http://localhost`
   - `http://localhost:8080`
   - `http://localhost:5173`

### Opção 2: Configurar Variáveis de Ambiente

Na verdade, o Supabase **não deveria bloquear** requisições de localhost por padrão. Se está bloqueando, pode ser:

1. **Firewall/Proxy:** Verifique se há proxy corporativo ou firewall bloqueando
2. **HTTPS vs HTTP:** Se o site está em HTTPS mas o Supabase em HTTP (ou vice-versa)
3. **Configuração de rede:** ISP bloqueando requisições

### Opção 3: Verificar RLS (Row Level Security)

O erro pode ser de **permissão** e não CORS:

1. Vá em **Authentication** → **Policies** no dashboard do Supabase
2. Verifique se a tabela `users_hub` tem uma política que permite SELECT:
   - Policy name: Exemplo
   - Table: users_hub
   - Operation: SELECT
   - Target: public
   - Expression: `true` (permite todos)

```sql
-- Execute no SQL Editor do Supabase
CREATE POLICY "Permitir SELECT público" 
ON users_hub 
FOR SELECT 
TO public 
USING (true);
```

## 🧪 Passo 2: Testar a Query

Execute a validação no app e verifique o console:

```
🧪 TESTE 1: Verificando conectividade...
✅ TESTE 1 - Status: 200
✅ TESTE 1 - Dados: [...]
❌ TESTE 1 - Erro: null
```

Se TESTE 1 passar mas TESTE 2 falhar, o problema é com o filtro `.eq()`

## 📊 O que os logs vão mostrar

### Se TESTE 1 falhar:
- **Erro 42501:** Problema de permissão RLS
- **Erro de rede:** Problema de conectividade/DNS
- **Erro CORS:** Problema de política de acesso

### Se TESTE 1 passar mas TESTE 2 falhar:
- Verifique se o e-mail está cadastrado corretamente
- Verifique se a coluna `email` está com o tipo correto (TEXT/VARCHAR)

## 🆘 Se nada funcionar

1. Crie um novo projeto Supabase
2. Copie as novas credenciais para `src/lib/supabase.ts`
3. Execute o template SQL em `SETUP_SUPABASE.md`

