# Gestao de Promocoes

Aplicacao interna em Next.js para gerenciar promocoes de produtos por loja, acompanhar vencimentos, enviar lembretes pelo WhatsApp e manter historico operacional.

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS + lucide-react
- Supabase Postgres e Supabase Storage
- Route Handlers protegidos por sessao HTTP-only
- bcryptjs para hashing bcrypt de senhas
- WhatsApp Web local via `whatsapp-web.js`
- Zod + React Hook Form
- Vercel Cron

## Principais Recursos

- Login interno com cookie HTTP-only, `sameSite=lax` e cookie seguro em producao.
- Cadastro interno protegido por `REGISTRATION_CODE`.
- Estrutura pronta para roles: `admin`, `manager`, `viewer`.
- Dashboard com filtros combinaveis, busca, cards de estatisticas, estados de loading/erro/vazio e toasts.
- Paginas dedicadas para `BONONI ACESSORIOS` e `BATTOGO`.
- CRUD de promocoes com validacao forte e SKU unico por loja.
- Upload de imagens via API autenticada do Next.js, usando service role apenas no servidor.
- Detalhe completo do produto com historico de mensagens.
- Envio manual de WhatsApp pelo dashboard, loja e detalhe do produto.
- Cron seguro por `CRON_SECRET` para lembretes automaticos.
- Prevencao de lembrete automatico duplicado para o mesmo produto no mesmo dia.

## Variaveis de Ambiente

Crie `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

WHATSAPP_REMINDER_RECIPIENTS=+5500000000000,+5500000000001
WHATSAPP_WEB_SESSION_PATH=.wwebjs_auth
WHATSAPP_BROWSER_EXECUTABLE_PATH=
WHATSAPP_AUTH_TIMEOUT_MS=120000

CRON_SECRET=
SESSION_SECRET=
REGISTRATION_CODE=

ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Notas:

- `NEXT_PUBLIC_*` pode ir para o browser.
- `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET` e `CRON_SECRET` nunca devem ser expostos no browser.
- `SESSION_SECRET` deve ter pelo menos 32 caracteres aleatorios.
- `REGISTRATION_CODE` libera o cadastro de novos usuarios internos.
- `WHATSAPP_REMINDER_RECIPIENTS` aceita uma lista separada por virgula.

## Setup Local

```bash
pnpm install
pnpm dev
```

Se `pnpm` nao estiver no PATH, use o runtime local disponivel na sua maquina ou instale Node.js 22+ e pnpm.

## Supabase

Rode as migrations no SQL Editor do Supabase, nesta ordem:

```text
supabase/migrations/001_create_product_promotions.sql
supabase/migrations/002_admin_users_indexes_and_message_metadata.sql
supabase/migrations/003_registration_admin_users.sql
```

As migrations criam:

- `product_promotions`
- `sent_messages`
- `admin_users`
- bucket `product-images`
- indices para filtros frequentes
- trigger `updated_at`
- constraint unica `(store_id, sku)`

O bucket `product-images` fica publico para leitura. Escrita publica deve ficar desativada; o app envia imagens por `/api/uploads/product-image`, que exige login e usa service role no servidor.

## Primeiro Admin e Cadastro

Voce pode criar usuarios pela tela:

1. Acesse `/login`.
2. Clique em `Registrar`.
3. Informe o codigo configurado em `REGISTRATION_CODE`.
4. Cadastre nome, email e senha.

Ou pelo script. Preencha no `.env.local`:

```env
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Depois rode:

```bash
pnpm create-admin
```

O script cria ou atualiza o usuario em `admin_users` com hash bcrypt.

## Rotas

- `/login` - login interno
- `/register` - cadastro interno com codigo
- `/dashboard` - painel geral
- `/products/new` - criar promocao
- `/products/[id]/edit` - editar promocao
- `/stores/bononi-acessorios` - loja BONONI ACESSORIOS
- `/stores/battogo` - loja BATTOGO
- `/stores/[store]/products/[id]` - detalhe do produto

APIs sensiveis exigem sessao:

- `/api/auth/me`
- `/api/products`
- `/api/products/[id]`
- `/api/products/[id]/send-message`
- `/api/stores/[storeId]/products`
- `/api/stores/[storeId]/stats`
- `/api/uploads/product-image`
- `/api/test-supabase`

API publica controlada por codigo:

- `/api/auth/register`

O cron usa apenas `CRON_SECRET`:

```http
POST /api/cron/check-ending-promotions
Authorization: Bearer <CRON_SECRET>
```

## WhatsApp Web

O envio automatico nao usa Twilio nem WhatsApp Cloud API. Ele usa uma sessao local do WhatsApp Web controlada por `whatsapp-web.js`.

Antes do primeiro envio, autentique a sessao:

```bash
pnpm whatsapp:login
```

Se `pnpm` nao estiver no PATH, rode:

```bash
corepack pnpm whatsapp:login
```

Escaneie o QR Code no terminal com o WhatsApp do celular. A sessao fica salva em `.wwebjs_auth`, que nao deve ser commitado.

Configuracoes:

- `WHATSAPP_REMINDER_RECIPIENTS`: numeros que recebem os lembretes automaticos e manuais.
- `WHATSAPP_WEB_SESSION_PATH`: pasta local da sessao do WhatsApp Web.
- `WHATSAPP_BROWSER_EXECUTABLE_PATH`: caminho opcional para Chrome/Edge, se a deteccao automatica nao encontrar.
- `WHATSAPP_AUTH_TIMEOUT_MS`: tempo maximo aguardando a sessao ficar pronta ao enviar.

O texto da mensagem fica em `lib/messages.ts`. O envio fica em `lib/whatsapp.ts`.

```text
WHATSAPP_REMINDER_RECIPIENTS=+5500000000000,+5500000000001
```

Observacao: `whatsapp-web.js` e uma integracao nao oficial sobre WhatsApp Web. Para funcionar de forma automatica, o app precisa rodar em uma maquina com Chrome/Edge instalado, sessao persistente e acesso ao WhatsApp Web.

## Vercel

1. Crie o projeto na Vercel.
2. Configure todas as env vars do `.env.example`.
3. Rode as migrations no Supabase.
4. Rode `pnpm create-admin` localmente ou em ambiente seguro apontando para o Supabase de producao.
5. Configure o Cron pela `vercel.json` apenas se o ambiente tiver suporte a navegador persistente para WhatsApp Web.

```json
{
  "crons": [
    {
      "path": "/api/cron/check-ending-promotions",
      "schedule": "0 12 * * *"
    }
  ]
}
```

## Logos

- Mercado Livre: `public/logos/mercado-livre.png`
- BATTOGO preto: `public/logos/battogo-black.svg`
- BATTOGO branco: `public/logos/battogo-white.svg`
- BONONI preto: `public/logos/bononi-black.svg`
- BONONI branco: `public/logos/bononi-white.svg`

## Seguranca

- Nao commit `.env.local`.
- Rotacione a service role key se ela for compartilhada fora de um cofre de senhas.
- Mantenha `SUPABASE_SERVICE_ROLE_KEY` apenas em server-side code.
- Todas as paginas internas passam por middleware e verificacao de sessao.
- APIs de produto, loja, mensagem e upload validam autenticacao no servidor.
- O cron rejeita chamadas sem `CRON_SECRET`.
- Erros de Supabase/WhatsApp Web sao logados no servidor e retornam mensagens amigaveis para a UI.

## Validacao Final

Antes de deploy:

```bash
pnpm typecheck
pnpm lint
pnpm build
```
