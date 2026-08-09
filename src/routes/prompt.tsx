import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, Download, LayoutPanelLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PromptSidebar } from "@/components/prompt-sidebar";
import { buildPromptParts, estimateTokens } from "@/lib/project-spec";

export const Route = createFileRoute("/prompt")({
  head: () => ({
    meta: [
      { title: "Gerador de system prompt — Cora Extrator" },
      {
        name: "description",
        content:
          "Gere o system prompt completo do Cora Extrator, dividido em partes copiáveis para não estourar o limite de tokens da sua LLM.",
      },
      { property: "og:title", content: "Gerador de system prompt — Cora Extrator" },
      {
        property: "og:description",
        content:
          "Especificação completa do projeto em partes numeradas, prontas para colar em qualquer LLM.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PromptStudio,
});

const BUDGETS = [
  { label: "Curto — ~1k tokens/parte", chars: 4000 },
  { label: "Médio — ~2k tokens/parte", chars: 8000 },
  { label: "Longo — ~4k tokens/parte", chars: 16000 },
  { label: "Único — sem divisão", chars: 200000 },
];

function PromptStudio() {
  const [budget, setBudget] = useState(BUDGETS[1]!.chars);
  const searchParams = Route.useSearch();
  const targetUrl = (searchParams as any).url;
  const parts = useMemo(() => buildPromptParts(budget, targetUrl), [budget, targetUrl]);
  const totalTokens = parts.reduce((sum, p) => sum + estimateTokens(p), 0);

  async function copiar(text: string, rotulo: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${rotulo} copiada.`);
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  function baixar() {
    const conteudo = parts
      .map((p, i) => `----- PARTE ${i + 1} -----\n\n${p}`)
      .join("\n\n\n");
    const url = URL.createObjectURL(new Blob([conteudo], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cora-extrator-system-prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Ambiente de prompt
        </p>
        <h1 className="mt-3 font-serif text-4xl font-light leading-none sm:text-6xl">
          Gere o system prompt deste projeto
        </h1>
        <p className="mt-5 max-w-2xl font-serif text-[15px] italic leading-relaxed text-muted-foreground">
          A especificação completa do Cora Extrator — stack, design, rotas, banco, pipeline de
          extração, exportações e extensão — dividida em partes numeradas para colar em
          qualquer LLM sem estourar o limite de tokens.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-foreground/15 py-4">
          {BUDGETS.map((b) => (
            <button
              key={b.chars}
              type="button"
              onClick={() => setBudget(b.chars)}
              className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                budget === b.chars
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/25 text-muted-foreground hover:border-foreground/60"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {parts.length} parte(s) · ~{totalTokens.toLocaleString("pt-BR")} tokens no total
          </p>
          <button
            type="button"
            onClick={baixar}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/25 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] hover:border-foreground/60"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            Baixar .txt
          </button>
        </div>

        <ol className="mt-8 space-y-6">
          {parts.map((part, i) => (
            <li
              key={i}
              className="rounded-3xl border border-foreground/15 bg-card/60 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                  Parte {i + 1} de {parts.length} · ~
                  {estimateTokens(part).toLocaleString("pt-BR")} tokens
                </span>
                <button
                  type="button"
                  onClick={() => copiar(part, `Parte ${i + 1}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-background hover:opacity-90"
                >
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  Copiar
                </button>
              </div>
              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-muted-foreground">
                {part}
              </pre>
            </li>
          ))}
        </ol>

        <p className="mt-10 font-serif text-[14px] italic leading-relaxed text-muted-foreground">
          Cole as partes em ordem, uma por mensagem. A LLM confirma cada parte e só começa a
          implementar depois da última.
        </p>
      </main>
    </div>
  );
}
