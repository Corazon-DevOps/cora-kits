# Corrigir login com Google + extensão de navegador

## 1. Login com Google

Sintomas prováveis (a corrigir juntos):

- O provedor Google precisa ser (re)ativado na configuração de autenticação do backend — sem isso todo clique falha com "Unsupported provider".
- Em `entrar.tsx`, o `onGoogle` não trata o caso de sucesso sem redirect: quando os tokens voltam direto (fluxo em popup do preview), a sessão é definida mas nada acontece na tela.
- O destino pretendido (`?redirect=`) é perdido: `redirect_uri` aponta só para a origem.
- Mensagem de erro genérica, sem detalhe do motivo.

Mudanças:

- Ativar o provedor Google (login social gerenciado) no mesmo passo da entrega.
- `onGoogle`: guardar o destino desejado em `sessionStorage`, chamar `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`, e após sucesso sem redirect confirmar a sessão e navegar para o destino.
- Após retorno do OAuth (efeito na página inicial/entrar), se houver sessão e destino salvo, navegar e limpar o valor.
- Mostrar o motivo do erro traduzido no toast.

## 2. Novas funções utils

Em `src/lib/utils.ts` (e um novo `src/lib/brand-utils.ts` para o que for específico de marca), funções puras e reutilizáveis também pela extensão:

- normalização/validação de URL, extração de domínio e nome legível da marca
- conversão de cor (hex/rgb/hsl), contraste WCAG, escolha de cor de texto legível, ordenação de paleta por luminância
- agrupamento de cores parecidas (dedupe por distância)
- inferência de escala tipográfica a partir de tamanhos coletados
- helpers de formatação: slug, cópia para clipboard, download de arquivo, `formatBytes`

## 3. Extensão de navegador (Manifest V3)

Pasta `extension/` com:

- `manifest.json` (MV3, permissões `activeTab`, `scripting`, `storage`)
- `popup.html` + `popup.js` com a estética do Cora (Courier Prime / Cormorant, fundo creme)
- `content.js` (injetado sob demanda) que lê a página atual: cores computadas de fundo/texto/bordas, famílias e tamanhos de fonte, logo (`link[rel=icon]`, `img` no header, `og:image`), textos de destaque para tom de voz
- Popup mostra paleta com hex clicável (copiar), tipografia detectada, logo e botão **"Abrir no Cora Extrator"** que envia a URL para o app (`/?url=...`) para a extração completa
- Botão **"Copiar tokens"** (JSON/CSS variables) — funciona 100% offline, em qualquer site, sem login
- Empacotamento em `public/cora-extrator-extension.zip` e uma seção na página inicial (ou em `/apoiar`) com botão de download via fetch+blob e as instruções de instalação (modo desenvolvedor → carregar sem compactação)

A lógica de cor/tipografia da extensão reaproveita as mesmas regras das utils (arquivo espelhado, sem bundler, JS puro).

## Notas técnicas

- A extensão não usa chaves nem credenciais; toda a leitura é local na aba ativa.
- Ícones da extensão a partir do `public/favicon.png` existente.
- `zip` via `nix run nixpkgs#zip` no empacotamento.
