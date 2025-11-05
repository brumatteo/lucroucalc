# 🔧 Como Corrigir o Erro de Conexão com Supabase

## ❌ Problema Identificado

O servidor Supabase configurado nas variáveis de ambiente está **inacessível**.
Erro: `ERR_NAME_NOT_RESOLVED`

## ✅ Solução

### PASSO 1: Verificar seu projeto Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Verifique se seu projeto está **ATIVO** e **NÃO pausado**
4. Se estiver pausado, clique em "Resume project" (pode ter custo)

### PASSO 2: Obter as credenciais corretas

1. No dashboard do Supabase, clique em **Settings** (⚙️)
2. Clique em **API** no menu lateral
3. Copie estas informações:
   - **Project URL** → Algo como `https://xxxxx.supabase.co`
   - **anon public** key (a chave longa)

### PASSO 3: Atualizar o arquivo `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://SEU-PROJETO.supabase.co'  // Cole aqui a URL do PASSO 2
const supabaseAnonKey = 'sua-chave-anon-aqui'  // Cole aqui a chave do PASSO 2

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### PASSO 4: Verificar a tabela users_hub

1. No dashboard do Supabase, vá em **Table Editor**
2. Verifique se existe a tabela `users_hub`
3. Verifique se tem os campos: `id`, `email`, `nome`, `created_at`
4. Adicione um e-mail de teste (ex: `bu_med@hotmail.com`)

### PASSO 5: Verificar as políticas (Row Level Security)

1. Vá em **Authentication** → **Policies**
2. Clique na tabela `users_hub`
3. Crie uma policy (se não existir):
   - Policy name: "Permitir SELECT anônimo"
   - Allowed operation: `SELECT`
   - Policy target: `public`
   - Expression: `true` (permite todos os SELECTs)

## 🧪 Como Testar

Após fazer as alterações:

1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Tente fazer login com um e-mail cadastrado
3. Abra o Console do navegador (F12) e verifique os logs

## 🆘 Se ainda não funcionar

### Alternativa: Verificar firewall/antivírus

1. Desative temporariamente o antivírus
2. Verifique se o firewall Windows não está bloqueando
3. Tente em outro navegador

### Alternativa: Criar novo projeto

Se o projeto atual não está mais acessível:

1. Crie um novo projeto em: https://supabase.com/dashboard
2. Copie as novas credenciais
3. Atualize `src/lib/supabase.ts`
4. Crie a tabela `users_hub` novamente

## 📋 Template SQL para criar a tabela

```sql
-- Criar tabela users_hub
CREATE TABLE users_hub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir e-mail de teste
INSERT INTO users_hub (email, nome) 
VALUES ('bu_med@hotmail.com', 'Usuario Teste');

-- Habilitar Row Level Security
ALTER TABLE users_hub ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT público
CREATE POLICY "Permitir SELECT anônimo"
ON users_hub
FOR SELECT
TO public
USING (true);
```

