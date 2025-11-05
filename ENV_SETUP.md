# Environment setup

Create a `.env` file at the project root with:

## Variáveis Obrigatórias

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ IMPORTANTE**: Estas variáveis são OBRIGATÓRIAS. O projeto não funcionará sem elas.

## Variáveis Opcionais

```env
VITE_APP_SECRET_KEY=your-secret-key-for-jwt-signing
VITE_ALLOWED_ORIGIN=https://your-domain.com
```

### Descrição das Variáveis

- **VITE_SUPABASE_URL**: URL completa do seu projeto Supabase (ex: `https://xxxxx.supabase.co`)
- **VITE_SUPABASE_ANON_KEY**: Chave pública (anon) do Supabase. Esta é segura para uso no cliente.
- **VITE_APP_SECRET_KEY**: Usado para validar tokens JWT do SSO (Plano Interativo). Use uma chave forte e aleatória (mínimo 32 caracteres recomendado).
- **VITE_ALLOWED_ORIGIN**: Domínio permitido para autenticação via URL (opcional, padrão: origem atual)

## Segurança

- ✅ Vite expõe apenas variáveis que começam com `VITE_` para o cliente
- ✅ **NUNCA** coloque service-role keys ou secrets sensíveis em variáveis `VITE_*`
- ✅ O arquivo `.env` é ignorado pelo Git via `.gitignore`
- ✅ Credenciais hardcoded foram removidas - todas as credenciais devem vir de variáveis de ambiente

