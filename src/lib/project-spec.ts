/**
 * Especificação completa do Cora Extrator em texto, pensada para servir de
 * SYSTEM prompt: uma LLM deve conseguir reconstruir o projeto idêntico lendo
 * as partes em ordem.
 */

export type SpecSection = {
  id: string;
  title: string;
  body: string;
};

export const SPEC_SECTIONS: SpecSection[] = [
  {
    id: "papel",
    title: "Papel e objetivo",
    body: `Você é um engenheiro sênior de produto full-stack. Sua tarefa é construir, do zero e de forma IDÊNTICA, o aplicativo web descrito.
Regras gerais:
- Não invente funcionalidades fora desta especificação; não remova nenhuma.
- Toda a interface é em português do Brasil (pt-BR).
- O produto é 100% gratuito; existe apenas uma página de apoio via Pix.
- Entregue código funcional, tipado e sem placeholders.
Resumo do produto: o aplicativo permite extrair a identidade visual (paleta, tipografia, logo, imagens, tom de voz e tokens de design) de qualquer site, montando um "kit de marca" navegável que pode ser editado, compartilhado e exportado.`,
  },
  {
    id: "stack",
    title: "Stack e arquitetura",
    body: `Stack obrigatória:
- TanStack Start v1 (React 19, SSR) com Vite 7 e roteamento por arquivos em src/routes. Nunca react-router-dom.
- TypeScript estrito. Tailwind CSS v4 configurado via src/styles.css (@theme, tokens semânticos), shadcn/ui em src/components/ui.
- Backend: Supabase (Postgres + Auth + Storage) acessado por server functions (createServerFn de @tanstack/react-start). Webhooks/API pública em src/routes/api/public/*.
- IA: gateway de chat completions compatível com OpenAI, modelo padrão "google/gemini-3-flash-preview", chamado só no servidor com a chave em variável de ambiente.
- Scraping: Firecrawl (endpoints /v2/scrape e /v2/map) com fallback de scraping direto em HTML puro quando não houver chave.
- Notificações com sonner; ícones com lucide-react; validação com zod.
Camadas de código:
- src/lib/*.functions.ts — server functions chamadas pelo cliente (thin wrappers).
- src/server/*.server.ts — código exclusivo de servidor (IA, scraping, fontes, guarda de URL, admin do Supabase).
- src/lib/* — utilitários isomórficos (cor, exportação, cache, tipografia).
- src/components/* — UI.`,
  },
  {
    id: "design",
    title: "Sistema de design",
    body: `Direção visual: papelaria editorial impressa, silenciosa, alto contraste, sem gradientes e sem estética genérica de SaaS.
Tokens (definidos como variáveis CSS semânticas, nunca cores hardcoded em componentes):
- fundo creme #F4EFE6; superfície #F9F6F0; tinta #0A0A0A; acento carmim #8B1A1A; linhas 1px sólidas na cor da tinta com opacidades 0.15–0.25.
Tipografia:
- Títulos: 'Cormorant Garamond', serif, peso 300, tamanhos grandes (40–96px), line-height ~1.
- Texto de apoio: 'Libre Baskerville', serif, itálico para legendas.
- Rótulos, botões e dados: 'Courier Prime', monospace, uppercase, letter-spacing 0.12em–0.24em, 10–12px.
Fontes carregadas por <link> no head da rota raiz (nunca @import remoto no CSS).
Padrões de UI: botões pílula (border-radius 999px), rótulos em caixa alta com colchetes tipo "[ EXTRAIR → ]", divisórias de 1px, cartões com sombra difusa muito suave, animações discretas e curtas (150–250ms).
Acessibilidade: contraste WCAG AA, foco visível, alt em imagens, um único H1 por página.`,
  },
  {
    id: "rotas",
    title: "Rotas e telas",
    body: `Rotas (arquivos em src/routes, cada uma com head() própio: title < 60 caracteres, description < 160, og:title, og:description, og:type, twitter:card):
- __root.tsx — layout global, fontes, <Toaster />, provider de autenticação, listener de sessão e redirecionamento pós-login (lê sessionStorage "cora:pos-login").
- index.tsx — landing: manifesto editorial, painel de ingestão (campo de URL + validação + estado de progresso), kits recentes, seções explicando extração.
- entrar.tsx — login/cadastro por e-mail e senha (zod: e-mail válido, senha 8–72) + "Continuar com o Google" + esqueci minha senha; parâmetro de busca ?redirect=/caminho.
- redefinir-senha.tsx — define nova senha após e-mail de recuperação.
- kit.$kitId.tsx — kit de marca: capa, paleta com contraste, espécimes tipográficos, logo e variações, tom de voz, tokens e bloco de exportação (âncora #export).
- library.tsx — biblioteca dos kits do usuário, com busca e exclusão.
- share.$shareToken.tsx — visualização pública somente leitura de um kit compartilhado.
- design.tsx, design.history.tsx, design.history.diff.tsx — documento de design vivo do projeto e histórico com diff.
- start-here.tsx — guia de primeiros passos.
- extensao.tsx — download e instalação da extensão de navegador.
- apoiar.tsx — apoio via Pix (chave copiável) explicando que a ferramenta é gratuita.
- prompt.tsx — gerador do SYSTEM prompt do próprio projeto, dividido em partes copiáveis.
- Cabeçalho fixo (SiteHeader) com marca "Cora Extrator", botões centrais e links Biblioteca, Extensão, Apoiar, Entrar/Sair e CTA "Novo kit".`,
  },
  {
    id: "dados",
    title: "Banco de dados e segurança",
    body: `Tabelas no schema public (todas com GRANT explícito, RLS habilitada e políticas por auth.uid()):
- profiles (id, user_id único, display_name, timestamps) — criada por trigger no cadastro.
- user_roles (id, user_id, role app_role enum: admin|moderator|user, único user_id+role) + função security definer has_role(_user_id, _role). Nunca guardar papel no perfil.
- brand_kits (id, user_id, source_url, name, status, palette jsonb, typography jsonb, logos jsonb, voice jsonb, tokens jsonb, share_token, timestamps).
- kit_voice (kit_id, tom, arquétipos, frases, do/don't).
- usage_counters (user_id, período, contagem) apenas para métricas — sem limite de uso.
- app_events/opcional para telemetria simples.
Triggers: update_updated_at_column() em BEFORE UPDATE de todas as tabelas com updated_at; handle_new_user() em auth.users criando profile e papel "user".
Storage: bucket público "brand-assets" para logos, favicons e fontes salvas.
Regras: leitura pública apenas via share_token com política restrita a anon; escrita sempre pelo dono; service role só em operações privilegiadas dentro de handlers.`,
  },
  {
    id: "extracao",
    title: "Pipeline de extração",
    body: `Fluxo ao enviar uma URL:
1. Normalizar a URL (adicionar https://, remover fragmento e parâmetros de rastreio) e bloquear destinos privados por uma guarda de URL no servidor.
2. Raspar a página: chamar Firecrawl /v2/scrape (formats: markdown, rawHtml, links, branding, summary) em corrida com um scraper direto próprio.
3. Imagens: o sistema deve identificar todas as tags <img> e extrair seus atributos src, além de og:image e favicons, garantindo que o prompt gerado para a IA inclua instruções para download dessas imagens.
4. Cores: extrair valores CSS, converter para HEX/RGB/HSL, deduplicar e classificar em primária, acento, superfícies e texto.
5. Tipografia: ler font-family, pesos e tamanhos; inferir escala tipográfica; resolver arquivos de fonte.
6. Logo: sondar candidatos (logos, wordmarks, marcas), validar e gerar variações.
7. Banco de dados (Condicional): se a IA detectar caminhos para arquivos de banco de dados (.sql, dumps, backups) ou endpoints de API que sugerem acesso a dados brutos, deve-se gerar um prompt SEPARADO para essa finalidade, não misturado com o conteúdo visual.
8. Tom de voz e resumo: chamada de IA com saída estruturada.
9. Montar tokens de design e persistir o kit.`,
  },
  {
    id: "recursos",
    title: "Edição, exportação e extensão",
    body: `Edição: o dono pode renomear o kit, reordenar e editar cores, trocar rótulos, remover fontes e substituir o logo por upload (Storage).
Compartilhamento: gerar share_token aleatório, rota pública /share/$shareToken somente leitura, com botão de copiar link.
Exportação: JSON de tokens, variáveis CSS (:root), paleta em .txt, e PDF do kit gerado no cliente; downloads por blob com nome de arquivo em kebab-case.
Utilitários compartilhados (src/lib/brand-utils.ts): normalizeUrl, parseColor, toHex/toRgb/toHsl, relativeLuminance, contrastRatio, wcagLevel, dedupeColors, inferTypeScale, downloadFromUrl, copyToClipboard.
Extensão de navegador (Manifest V3, pasta extension/, empacotada como zip em public/):
- manifest.json com permissões activeTab e scripting, sem host permissions amplas.
- popup.html/popup.js com a mesma estética editorial.
- scan.js injetado na aba ativa: percorre o DOM computando estilos, devolve paleta dominante ordenada por luminância, famílias e escala tipográfica, logo detectado.
- Botões para copiar tokens em JSON ou CSS e para abrir a URL atual direto no Cora Extrator.`,
  },
  {
    id: "auth",
    title: "Autenticação e implantação",
    body: `Autenticação:
- E-mail e senha com confirmação por e-mail (signUp com emailRedirectTo na origem) e recuperação de senha apontando para /redefinir-senha.
- Google OAuth. Em origens servidas pelo host gerenciado, usar o broker gerenciado; em qualquer outro domínio (Vercel, Netlify, self-host), usar supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } }) e cadastrar o domínio na lista de URLs de redirecionamento do projeto.
- Contexto de auth (src/lib/auth.tsx) com onAuthStateChange registrado uma única vez, expondo user, loading, signOut.
- Server functions protegidas usam middleware de autenticação e recebem cliente Supabase já autenticado; o cliente anexa o bearer via functionMiddleware em src/start.ts.
Implantação: SSR no host padrão; para hosts estáticos incluir fallback de rotas (vercel.json com rewrite para /index.html e public/_redirects com "/*  /index.html  200") para que refresh e deep links não retornem 404.
Qualidade: sem erros de tipo, sem console.error em fluxo normal, estados de carregando/erro/vazio em todas as telas, textos sempre em pt-BR.`,
  },
];

const HEADER = (url?: string) => `Você vai receber a especificação do site "${url || "alvo"}" dividida em PARTES numeradas.
Leia e memorize cada parte. Só comece a implementar depois da última parte.`;

export function buildPromptParts(maxChars: number, targetUrl?: string): string[] {
  const parts: string[] = [];
  let current = "";

  for (const section of SPEC_SECTIONS) {
    const block = `## ${section.title}\n${section.body}`;
    if (current && current.length + block.length + 2 > maxChars) {
      parts.push(current);
      current = block;
    } else {
      current = current ? `${current}\n\n${block}` : block;
    }
  }
  if (current) parts.push(current);

  const total = parts.length;
  return parts.map((body, i) => {
    const n = i + 1;
    const head =
      n === 1
        ? `${HEADER(targetUrl)}\n\n=== PARTE ${n} DE ${total} ===`
        : `Continuação da especificação do site "${targetUrl || "alvo"}".\n\n=== PARTE ${n} DE ${total} ===`;
    const foot =
      n === total
        ? `\n\n=== FIM DA ESPECIFICAÇÃO ===\nAgora implemente o projeto completo, idêntico a esta especificação.`
        : `\n\n(Responda apenas "PARTE ${n} RECEBIDA" e aguarde a próxima parte.)`;
    return `${head}\n\n${body}${foot}`;
  });
}

/** Estimativa conservadora: ~4 caracteres por token. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
