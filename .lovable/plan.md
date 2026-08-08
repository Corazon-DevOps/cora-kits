# Cora Extrator — tradução, marca, cadastro e plano de R$ 15/mês

Transformar o app atual (Brand Kit, sem login, uso livre) em um produto em português, com identidade "Cora Extrator", cadastro de usuário e assinatura mensal de R$ 15 — com 1 extração gratuita por conta.

## 1. Marca e identidade

- Novo nome em toda a interface e metadados: **Cora Extrator**.
- Gerar um símbolo quadrado minimalista (marca "C") no estilo tipográfico/preto-e-branco já usado no app.
- Salvar o ícone em `public/favicon.png` (versão quadrada reduzida) e apontar o favicon no cabeçalho raiz; remover o favicon padrão.
- Atualizar título, descrição, OG e Twitter de todas as rotas para textos em português com o novo nome.

## 2. Tradução para português (pt-BR)

Traduzir toda a interface visível ao usuário, mantendo termos técnicos consagrados (tokens, CSS, hex, Tailwind):

- Cabeçalho, navegação e CTAs.
- Página inicial e painel de ingestão (URL, upload, estados de erro).
- Etapas do progresso de extração e loaders.
- Página do kit (cores, tipografia, voz da marca, tokens, exportações, ações de edição).
- Biblioteca / kits recentes, página de compartilhamento, páginas de design doc e histórico.
- Mensagens de toast, validações, estados vazios e página 404.
- `lang="pt-BR"` no documento e formatação de datas em pt-BR.

Nomes de exportação de arquivos e chaves técnicas geradas permanecem em inglês para não quebrar integrações.

## 3. Cadastro e login

Hoje o `useAuth` é um stub sem autenticação. Vamos ativar autenticação real:

- Métodos: **e-mail/senha + Google** (Google configurado no mesmo passo).
- Nova rota pública `/entrar` com cadastro, login e recuperação de senha, além da rota `/redefinir-senha`.
- Perfil do usuário criado automaticamente no cadastro (a tabela `profiles` já existe com esse gatilho).
- Cabeçalho passa a refletir a sessão: entrar / menu da conta com sair.
- Kits criados anonimamente no navegador são vinculados à conta no primeiro login (a função de reivindicação já existe).
- Biblioteca e edição de kits passam a exigir sessão; a página pública de compartilhamento continua aberta.

## 4. Assinatura de R$ 15/mês e limite gratuito

- Habilitar o sistema de pagamentos integrado do Lovable e criar o produto **Cora Extrator — Mensal, R$ 15/mês** (BRL, recorrente).
- Regra de acesso:
  - Conta nova: **1 extração gratuita**.
  - Depois disso, novas extrações exigem assinatura ativa.
  - Visualizar, exportar e editar kits já criados continua liberado.
- Nova tabela de assinaturas por usuário (status, período, IDs do provedor) e contador de extrações usadas.
- Verificação de direito de acesso feita no servidor, antes de iniciar qualquer extração — não apenas na interface.
- Página `/planos` em português com o preço de R$ 15/mês, o que está incluído, botão de assinar e link para gerenciar/cancelar.
- Quando o limite gratuito acabar, o painel de ingestão mostra um aviso e leva para `/planos`.
- Webhook do provedor de pagamento mantém o status da assinatura atualizado (ativa, cancelada, pagamento falhou).

## 5. UP visual

- Atualizar textos de posicionamento com o novo nome e proposta ("extraia a identidade visual de qualquer site").
- Aplicar a nova marca no cabeçalho, no herói e no rodapé, mantendo o estilo editorial monoespaçado existente.
- Ajustar a página inicial para mostrar o valor + preço e o CTA de cadastro.

## Detalhes técnicos

- Rotas protegidas ficam sob `src/routes/_authenticated/`; a inicial e o compartilhamento permanecem públicos com SSR.
- `src/lib/auth.tsx` deixa de ser stub e passa a expor sessão real via `onAuthStateChange`, com invalidação de rotas na raiz.
- Middleware de bearer registrado em `src/start.ts` para as server functions autenticadas.
- Gate de assinatura implementado em server function com `requireSupabaseAuth`, chamado por `extraction.functions.ts` antes de `extraction.server.ts`.
- Novas tabelas com RLS + GRANTs: assinaturas e uso, ambas com política escopo `auth.uid()`; escrita de status via webhook com service role.
- Webhook do pagamento em `src/routes/api/public/*` com verificação de assinatura da requisição.

## Pré-requisitos

- Pagamentos integrados exigem plano **Pro** ou superior na conta Lovable.
- Vou confirmar o provedor de pagamento adequado (Stripe ou Paddle) para produto digital com cobrança em reais antes de habilitar; você preenche um formulário curto durante a ativação.

## Ordem de execução

1. Marca, favicon, renomeação e tradução completa.
2. Autenticação (cadastro/login/Google) e rotas protegidas.
3. Tabelas de assinatura/uso + gate de 1 extração gratuita.
4. Ativação de pagamentos, produto de R$ 15/mês, página de planos e webhook.
