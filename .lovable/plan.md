# Plano de Implementação - Lista de Kits na Página de Prompt

Adicionar uma barra lateral na página `/prompt` que exibe a lista de sites já extraídos (biblioteca). Ao clicar em um site, o prompt deve ser regenerado com base nos dados desse site.

## Alterações Propostas

### 1. Componente de Barra Lateral (`src/components/prompt-sidebar.tsx`)
- Criar um novo componente para exibir a lista de kits.
- Utilizar `listKitsByOwner` para buscar os dados.
- Seguir o estilo visual da biblioteca/kits recentes (minimalista, editorial).

### 2. Rota de Prompt (`src/routes/prompt.tsx`)
- Modificar o layout para incluir a barra lateral (layout em grid ou flex).
- Gerenciar o estado do kit selecionado.
- Atualizar a chamada para `buildPromptParts` para usar os dados do kit selecionado (URL, nome, etc.).
- Garantir que a seleção de um kit atualize a URL via search params para manter a consistência.

### 3. Lógica de Prompt (`src/lib/project-spec.ts`)
- Verificar se `buildPromptParts` precisa de ajustes para receber metadados adicionais do kit se estiverem disponíveis (já parece aceitar URL).

## Verificação
- Acessar `/prompt` e verificar se a barra lateral aparece.
- Clicar em um kit e observar se os prompts são atualizados.
- Verificar responsividade (a barra lateral deve se comportar bem em mobile).
