# 🚀 Deploy do Sistema de Gestão Clínica na Vercel

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Projeto Supabase** configurado
3. **Repositório GitHub** já criado (✅ Feito!)

## 🛠️ Configuração das Variáveis de Ambiente

### No Supabase
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** → **API**
3. Copie as seguintes informações:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **Anon key** (chave pública)

### Na Vercel
Você precisará configurar essas variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 Deploy Automático

### Opção 1: Via Dashboard da Vercel (Recomendado)

1. **Acesse** [vercel.com/new](https://vercel.com/new)
2. **Conecte o GitHub** se ainda não estiver conectado
3. **Selecione** o repositório `sistema-clinica`
4. **Configure as variáveis**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Clique em Deploy**

### Opção 2: Via CLI da Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy do projeto
vercel

# Seguir as instruções e configurar as variáveis quando solicitado
```

## ⚙️ Configurações Recomendadas

### Build Settings na Vercel
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Domain Settings
- Configure um domínio personalizado se necessário
- A Vercel fornece um domínio gratuito: `sistema-clinica.vercel.app`

## 🔧 Configurações Pós-Deploy

### 1. Verificar Funcionamento
- Acesse o site deployado
- Teste o login com as credenciais demo
- Verifique se todas as páginas estão carregando

### 2. Configurar Domínio Personalizado (Opcional)
- Na Vercel, vá em **Settings** → **Domains**
- Adicione seu domínio personalizado
- Configure os DNS conforme instruções

### 3. Monitoramento
- Ative **Analytics** na Vercel
- Configure **Web Vitals** para monitorar performance
- Use **Functions** log para debug se necessário

## 🛡️ Segurança

### Variáveis de Ambiente
- ✅ **Nunca commite** as chaves no código
- ✅ **Use apenas** as variáveis `NEXT_PUBLIC_*` para dados públicos
- ✅ **Configure RLS** no Supabase para proteção

### HTTPS
- ✅ A Vercel fornece HTTPS automaticamente
- ✅ Todos os dados são criptografados em trânsito

## 🐛 Troubleshooting

### Erro de Build
```bash
# Teste local antes do deploy
npm run build
npm run start
```

### Erro de Variáveis
- Verifique se as variáveis estão corretas
- Confirme que começam com `NEXT_PUBLIC_`
- Teste a conexão com Supabase localmente

### Erro 404 em Rotas
- Confirme que todas as páginas estão no formato correto
- Verifique se o middleware está configurado

## 📊 Performance

### Otimizações Automáticas da Vercel
- ✅ **Edge Functions** para melhor performance
- ✅ **Image Optimization** automática
- ✅ **Compression** de assets
- ✅ **CDN Global** para baixa latência

### Métricas Esperadas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🔄 CI/CD Automático

A Vercel já configura automaticamente:
- ✅ **Deploy em cada push** para `main`
- ✅ **Preview deploys** para pull requests
- ✅ **Rollback automático** em caso de erro

## 📞 Suporte

### Logs e Debug
- Acesse **Functions** tab na Vercel para logs
- Use `console.log` para debug (aparecem nos logs)
- Configure alertas para erros críticos

### Links Úteis
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**🎉 Seu Sistema de Gestão Clínica estará online em minutos!**

**URL do Projeto**: https://github.com/PatricSM/sistema-clinica
**Demo Live**: `[URL da Vercel após deploy]`
