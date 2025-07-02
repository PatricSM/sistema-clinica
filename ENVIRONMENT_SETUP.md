# 🔧 Configuração de Variáveis de Ambiente

## 📋 Resumo

Este documento explica como configurar corretamente as variáveis de ambiente para o Sistema Clínica.

## 🚀 Configuração Rápida

1. **Copie o template:**
```bash
cp .env.example .env
```

2. **Configure as variáveis obrigatórias no arquivo `.env`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-super-secure-jwt-secret-key
```

## 📝 Variáveis Disponíveis

### 🔴 **Obrigatórias**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `sua-chave-super-segura-2024` |

### 🟡 **Opcionais**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role (operações admin) | - |
| `NODE_ENV` | Ambiente de execução | `development` |
| `NEXTAUTH_URL` | URL base da aplicação | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Chave secreta do NextAuth | - |
| `APP_NAME` | Nome da aplicação | `"Sistema Clínica"` |
| `APP_VERSION` | Versão da aplicação | `0.1.0` |
| `APP_URL` | URL da aplicação | `http://localhost:3000` |

### 📧 **Configurações de Email**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Porta SMTP | `587` |
| `SMTP_USER` | Usuário SMTP | `your-email@gmail.com` |
| `SMTP_PASS` | Senha/App Password | `your-app-password` |
| `FROM_EMAIL` | Email remetente | `noreply@sistema-clinica.com` |

### 📁 **Configurações de Upload**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `MAX_FILE_SIZE` | Tamanho máximo de arquivo (bytes) | `5242880` (5MB) |
| `UPLOAD_DIR` | Diretório de uploads | `./uploads` |

### 🔗 **APIs Externas**

| Variável | Descrição |
|----------|-----------|
| `GOOGLE_MAPS_API_KEY` | Chave da API do Google Maps |
| `WHATSAPP_API_TOKEN` | Token da API do WhatsApp Business |

## 🔑 Como Obter Credenciais do Supabase

### 1. Acesse o Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login ou crie uma conta

### 2. Crie/Acesse seu Projeto
- Crie um novo projeto ou selecione um existente
- Aguarde a inicialização (pode levar alguns minutos)

### 3. Obtenha as Credenciais
- Vá para **Settings** → **API**
- Copie as informações:

```
Project URL → NEXT_PUBLIC_SUPABASE_URL
anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role → SUPABASE_SERVICE_ROLE_KEY (opcional)
```

## 🔐 Segurança

### ⚠️ **Importante:**
- **NUNCA** commite arquivos `.env` no Git
- Use chaves JWT fortes (mínimo 32 caracteres)
- Em produção, use o `SUPABASE_SERVICE_ROLE_KEY` apenas quando necessário
- Mantenha as variáveis de ambiente seguras no deploy

### 🛡️ **Boas Práticas:**
- Use diferentes projetos Supabase para desenvolvimento/produção
- Rotacione as chaves periodicamente
- Use variáveis de ambiente específicas por ambiente

## 🚀 Deploy em Produção

### Vercel
1. Vá para o dashboard do Vercel
2. Acesse **Settings** → **Environment Variables**
3. Adicione todas as variáveis necessárias
4. **Importante:** Marque as variáveis como "Production", "Preview" e "Development" conforme necessário

### Outras Plataformas
- **Railway**: Configure em Settings → Variables
- **Heroku**: Use `heroku config:set VARIABLE=value`
- **Netlify**: Configure em Site Settings → Environment Variables

## 🧪 Validação

Para verificar se as variáveis estão configuradas corretamente:

```bash
# Teste o build
npm run build

# Se tudo estiver correto, inicie o projeto
npm run dev
```

## ❓ Troubleshooting

### Erro: "Missing environment variables"
- Verifique se o arquivo `.env` existe
- Confirme se as variáveis obrigatórias estão definidas
- Reinicie o servidor de desenvolvimento

### Erro: "Supabase connection failed"
- Verifique se a URL e chave estão corretas
- Confirme se o projeto Supabase está ativo
- Teste a conexão no dashboard do Supabase

### Erro: "JWT verification failed"
- Verifique se `JWT_SECRET` está definido
- Use uma chave forte (mínimo 32 caracteres)
- Reinicie a aplicação após alterar

## 📞 Suporte

Se você encontrar problemas com a configuração:
1. Verifique se todas as variáveis obrigatórias estão definidas
2. Confirme se o formato está correto
3. Teste com as credenciais do Supabase
4. Consulte os logs de erro para mais detalhes

---

**Última atualização:** 02/07/2025
**Versão:** 1.0.0
