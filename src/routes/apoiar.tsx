import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";

const PIX_KEY = "picpayultra@gmail.com";

export const Route = createFileRoute("/apoiar")({
  head: () => ({
    meta: [
      { title: "Apoie o Cora Extrator — pague um café" },
      {
        name: "description",
        content:
          "O Cora Extrator é gratuito. Se ele te ajudou, contribua com um café via Pix para manter o projeto online.",
      },
      { property: "og:title", content: "Apoie o Cora Extrator" },
      {
        property: "og:description",
        content: "Ferramenta gratuita. Um café via Pix ajuda a manter os servidores no ar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Apoiar,
});

function Apoiar() {
  const [copied, setCopied] = useState(false);

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      toast.success("Chave Pix copiada. Obrigado pelo café!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Chave: " + PIX_KEY);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Apoie o projeto
        </p>
        <h1 className="mt-5 font-display text-5xl font-light leading-none">
          Gratuito. <em className="italic">Sempre.</em>
        </h1>
        <p className="mt-4 max-w-md font-serif text-base italic text-muted-foreground">
          Extrações ilimitadas, exportações completas e biblioteca — sem cobrança. Se o Cora
          Extrator te ajudou, me pague um café: é isso que mantém os servidores online.
        </p>

        <ul className="mt-10 border-t border-foreground/15">
          {[
            "Extrações ilimitadas de sites e arquivos",
            "Paleta, tipografia, voz e design tokens",
            "Exportação em CSS, Tailwind, JSON e PDF",
            "Biblioteca com todos os kits salvos",
            "Sem assinatura, sem cartão",
          ].map((item) => (
            <li
              key={item}
              className="flex items-baseline gap-4 border-b border-foreground/15 py-4 font-serif text-[15px]"
            >
              <span className="font-mono text-[11px] text-muted-foreground">—</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-3xl border border-foreground/15 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Chave Pix
          </p>
          <p className="mt-3 break-all font-mono text-[15px]">{PIX_KEY}</p>
          <button
            type="button"
            onClick={copyPix}
            className="mt-5 inline-flex rounded-full bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90"
          >
            {copied ? "[ COPIADA ✓ ]" : "[ COPIAR CHAVE PIX → ]"}
          </button>
          <p className="mt-4 font-serif text-[13px] italic text-muted-foreground">
            Qualquer valor ajuda — um café por mês já cobre a hospedagem.
          </p>
        </div>
      </main>
    </div>

  );
}
