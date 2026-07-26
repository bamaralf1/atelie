# Ateliê — Acompanhamento de Obras

Aplicação Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase para um
artista plástico cadastrar obras de pintura a óleo e permitir que cada cliente
acompanhe o andamento em tempo real através de um link exclusivo por token.

## Estrutura do projeto

```
src/
  app/
    admin/                    # Painel do artista (protegido por senha)
      layout.tsx
      page.tsx                 # Dashboard com cards das obras
      login/page.tsx
      nova-obra/
        page.tsx                # Formulário de cadastro
        actions.ts               # Server action: cria obra + upload de referência
      obras/[id]/
        page.tsx                 # Tela de edição (busca dados)
        actions.ts                # Server actions: status, materiais, fotos
        components/
          AbasObra.tsx            # Container das 4 abas
          TabVisaoGeral.tsx
          TabMateriais.tsx
          TabFotos.tsx
          TabCliente.tsx
    acompanhar/[token]/
      page.tsx                  # Server component: busca obra pelo token
      ClienteView.tsx            # Client component: realtime + UI
      not-found.tsx               # 404 personalizada para token inválido
    layout.tsx / globals.css / page.tsx
  components/
    admin/ (ObraCard, ProgressBar, StatusBadge)
    cliente/ (Timeline, Lightbox, PdfButton)
  hooks/
    useRealtimeObra.ts           # Assinatura Supabase Realtime
    useTempoDecorrido.ts          # "há X minutos"
  lib/
    supabase/ (client.ts, server.ts, admin.ts)
    types.ts / utils.ts
  middleware.ts                  # Proteção simples do /admin por senha
supabase/schema.sql              # Tabelas, triggers, RLS, buckets, Realtime
```

## 1. Pré-requisitos

- Node.js 18.18+
- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma conta na [Vercel](https://vercel.com) para o deploy

## 2. Configurando o Supabase

1. Crie um novo projeto em supabase.com.
2. Vá em **SQL Editor** e execute todo o conteúdo do arquivo `supabase/schema.sql`
   deste repositório. Isso cria:
   - As tabelas `obras`, `materiais`, `historico_status`, `fotos_progresso`;
   - Triggers que recalculam `custo_materiais` e registram automaticamente o
     `historico_status` quando o `status_atual` muda;
   - Políticas de RLS de **leitura pública** (necessárias para a página do
     cliente funcionar sem login) — todas as escritas são feitas via
     Service Role Key, que ignora RLS;
   - Os buckets de Storage `referencias` e `progresso`, já públicos para leitura;
   - A ativação do Realtime nas 4 tabelas.
3. Em **Project Settings > API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (mantenha em segredo)

## 3. Configuração local

```bash
cp .env.local.example .env.local
# edite .env.local com suas chaves do Supabase e escolha uma ADMIN_PASSWORD

npm install
npm run dev
```

Acesse `http://localhost:3000/admin`, informe a senha definida em
`ADMIN_PASSWORD` e cadastre sua primeira obra em **+ Nova Obra**.
Ao salvar, a aba **Cliente** da obra mostrará o link público
`/acompanhar/[token]` pronto para copiar e enviar.

## 4. Variáveis de ambiente

Veja `.env.local.example`:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (client-side, leitura pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (server-side apenas, nunca exposta ao browser) |
| `ADMIN_PASSWORD` | Senha simples para proteger `/admin` |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site em produção, usada para montar o link de acompanhamento |

## 5. Deploy na Vercel

1. Suba este projeto para um repositório Git (GitHub/GitLab/Bitbucket).
2. Em vercel.com, clique em **Add New Project** e importe o repositório.
   A Vercel detecta automaticamente o framework Next.js.
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`
   (incluindo `SUPABASE_SERVICE_ROLE_KEY` — ela é usada apenas em Server
   Actions/Components, nunca chega ao navegador).
4. Configure `NEXT_PUBLIC_SITE_URL` com o domínio final (ex:
   `https://seu-projeto.vercel.app`), para que os links gerados na aba
   **Cliente** apontem para o endereço correto.
5. Clique em **Deploy**. O `next.config.js` já está com `output: 'standalone'`,
   otimizado para o runtime da Vercel.
6. (Opcional) O `vercel.json` inclui um rewrite de `/obra/:token` para
   `/acompanhar/:token`, caso você prefira um link mais curto para enviar aos
   clientes.

## 6. Segurança

- A página `/acompanhar/[token]` é 100% pública: qualquer pessoa com o link
  acessa apenas os dados **daquela** obra, pois a busca é sempre filtrada por
  `token_acesso`. Token inválido → página 404 personalizada.
- O painel `/admin` é protegido por um middleware simples baseado em senha
  única (variável `ADMIN_PASSWORD`) — suficiente para um artista individual,
  mas não substitui autenticação multiusuário caso o produto cresça.
- Toda escrita no banco (criar obra, mudar status, adicionar material, subir
  foto) roda em Server Actions usando a Service Role Key — o cliente do
  navegador nunca tem permissão de escrita (RLS bloqueia por padrão).

## 7. Funcionalidades extras incluídas

- **Gerar relatório em PDF**: botão na página do cliente que monta um PDF
  (via `jsPDF`) com status, percentual, materiais/custos (se habilitado),
  linha do tempo e observações.
- **"Atualizado há X minutos/horas"**: indicador que se atualiza sozinho a
  cada 30 segundos, calculado a partir de `updated_at` da obra.
- **Notificação em tempo real**: toast discreto na página do cliente quando
  o artista publica uma mudança, via Supabase Realtime (sem necessidade de F5).

## 8. Personalização visual

A paleta (definida em `tailwind.config.ts`, prefixo `atelie-`) usa tons
quentes de preto e cinza com dourado envelhecido e terracota como acentos,
tipografia serifada (Fraunces) para títulos e Inter para o corpo do texto —
buscando transmitir a identidade de um ateliê de pintura tradicional.
