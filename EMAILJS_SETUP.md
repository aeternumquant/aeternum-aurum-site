# 📧 Configuração EmailJS - Aeternum Aurum

## 🚀 Passo 1: Criar Conta no EmailJS

1. Acesse: **https://www.emailjs.com/**
2. Clique em **"Sign Up Free"**
3. Crie uma conta com seu email ou Google
4. Confirme o email

---

## 🔑 Passo 2: Obter a Public Key

1. No dashboard do EmailJS, clique em **"Account"** (menu superior ou engrenagem)
2. Vá até **"API Keys"**
3. Copie a **"Public Key"** (aparece em destaque)
4. Cole em: `.env.local`
   ```
   VITE_EMAILJS_PUBLIC_KEY=sua_public_key_aqui
   ```

---

## 📧 Passo 3: Criar Email Service

1. No dashboard, clique em **"Email Services"** (menu esquerdo)
2. Clique em **"Add New Service"**
3. Escolha o provedor:
   - **Gmail** (recomendado)
   - Outlook / Yahoo / etc
4. Faça login na sua conta gmail@aeternumaurum.com
5. Autorize o acesso
6. Salve o serviço

**Você receberá um Service ID** (exemplo: `service_abc123def456`)

7. Cole em: `.env.local`
   ```
   VITE_EMAILJS_SERVICE_ID=service_abc123def456
   ```

---

## 📝 Passo 4: Criar Template de Email

1. No dashboard, clique em **"Email Templates"** (menu esquerdo)
2. Clique em **"Create New Template"**
3. **Escolha Service**: Selecione o serviço que criou no passo anterior
4. **Nome do Template**: `aeternum_access_request` (ou o nome que preferir)

### Configure o Template:

**Subject** (Assunto):
```
Nova Solicitação de Acesso - {{from_name}}
```

**To Email**:
```
{{to_email}}
```

**Body** (Corpo do Email):
```
Olá Gabriel,

Uma nova solicitação de acesso foi recebida:

📋 FORMULÁRIO RECEBIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nome: {{from_name}}
E-mail: {{from_email}}
Empresa/Instituição: {{empresa}}
Patrimônio Investível: {{patrimonio}}

Mensagem:
{{mensagem}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Para responder, use: {{from_email}}

Análise esperada em até 5 dias úteis.

—
Aeternum Aurum
https://aeternumaurum.com
```

5. Clique em **"Save"**
6. Copie o **Template ID** (aparece no topo da página)
7. Cole em: `.env.local`
   ```
   VITE_EMAILJS_TEMPLATE_ID=aeternum_access_request
   ```

---

## 🔐 Passo 5: Configurar o .env.local

Seu arquivo `.env.local` deve ficar assim:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=pk_YOUR_PUBLIC_KEY_HERE
VITE_EMAILJS_SERVICE_ID=service_YOUR_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID=template_YOUR_TEMPLATE_ID
VITE_EMAILJS_RECIPIENT_EMAIL=gabriel@aeternumaurum.com
```

---

## ✅ Passo 6: Testar Localmente

1. Inicie o servidor de desenvolvimento:
   ```bash
   cd d:\Usuários\Gabriel\Desktop\Aeternum_Q\site
   pnpm dev
   ```

2. Acesse: **http://localhost:5174/auth/acesso**

3. Preencha o formulário e clique em **"Enviar Solicitação"**

4. Você deve receber um email em **gabriel@aeternumaurum.com**

---

## 🔒 Passo 7: Deploy no Netlify

Após testar localmente, faça o deploy:

1. Gere o build:
   ```bash
   pnpm build
   ```

2. Arraste a pasta `dist/` para o Netlify

3. **No dashboard do Netlify:**
   - Vá para **"Site settings"** → **"Environment"**
   - Clique em **"Add environment variable"**
   - Adicione cada variável do `.env.local`:

   ```
   VITE_EMAILJS_PUBLIC_KEY = pk_YOUR_PUBLIC_KEY_HERE
   VITE_EMAILJS_SERVICE_ID = service_YOUR_SERVICE_ID
   VITE_EMAILJS_TEMPLATE_ID = template_YOUR_TEMPLATE_ID
   VITE_EMAILJS_RECIPIENT_EMAIL = gabriel@aeternumaurum.com
   ```

4. Salve e aguarde o redeploy automático

---

## 🛡️ Segurança

**IMPORTANTE:**
- ❌ **NÃO comite** o arquivo `.env.local` no Git
- ❌ **NÃO hardcode** as chaves no código
- ✅ **USE sempre variáveis de ambiente**
- ✅ Seu `.gitignore` já bloqueará `.env.local`

---

## 📊 Monitorar Envios

1. No dashboard do EmailJS, acesse **"Statistics"**
2. Veja todos os emails enviados, bounces, etc
3. Se algo falhar, você verá o erro ali

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Public Key not found" | Verify `VITE_EMAILJS_PUBLIC_KEY` está correto |
| Email não chega | Verifique spam/lixo; confira o email em Service Setup |
| Erro 400 | Verifique se Template Parameters correspondem aos campos do formulário |
| Netlify diz "variable undefined" | Certifique que adicionou as variáveis no site settings |

---

## 📞 Suporte

- Docs EmailJS: https://www.emailjs.com/docs/
- Status da API: https://status.emailjs.com/

Pronto! Seu formulário está configurado e seguro! 🎉
