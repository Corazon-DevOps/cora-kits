import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { downloadFromUrl } from "@/lib/brand-utils";

const ZIP_PATH = "/cora-extrator-extension.zip";

export const Route = createFileRoute("/extensao")({
  head: () => ({
    meta: [
      { title: "Extensão de navegador — Cora Extrator" },
      {
        name: "description",
        content:
          "Instale a extensão do Cora Extrator e leia paleta, tipografia e logo de qualquer site direto na aba aberta, sem sair da página.",
      },
      { property: "og:title", content: "Extensão de navegador — Cora Extrator" },
      {
        property: "og:description",
        content:
          "Leia paleta, tipografia e logo de qualquer site direto do navegador, offline e sem login.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Extensao,
});

const steps = [
  "Baixe o arquivo .zip e descompacte a pasta.",
  "Abra chrome://extensions no Chrome, Edge, Brave, Arc ou Opera.",
  "Ative o Modo do desenvolvedor no canto superior direito.",
  "Clique em Carregar sem compactação e selecione a pasta descompactada.",
  "Abra qualquer site e clique no ícone do Cora Extrator.",
];

const features = [
  "Paleta dominante da página, ordenada por luminância",
  "Famílias tipográficas e escala de tamanhos em uso",
  "Logo detectado (header, og:image ou favicon)",
  "Copiar tokens em JSON ou variáveis CSS",
  "Abrir a URL direto no Cora Extrator para a extração completa",
];

function Extensao() {
  const [busy, setBusy] = useState(false);

  async function baixar() {
    setBusy(true);
    try {
      await downloadFromUrl(ZIP_PATH, "cora-extrator-extension.zip");
      toast.success("Download iniciado. Descompacte e carregue no navegador.");
    } catch {
      toast.error("Não foi possível baixar agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Extensão de navegador
        </p>
        <h1 className="mt-5 font-display text-5xl font-light leading-none">
          A identidade de <em className="italic">qualquer site</em>, num clique.
        </h1>
        <p className="mt-4 max-w-md font-serif text-base italic text-muted-foreground">
          A extensão lê a aba aberta localmente — sem servidor, sem login, sem chave. Funciona em
          qualquer página http ou https.
        </p>

        <ul className="mt-10 border-t border-foreground/15">
          {features.map((item) => (
            <li
              key={item}
              className="flex items-baseline gap-4 border-b border-foreground/15 py-4 font-serif text-[15px]"
            >
              <span className="font-mono text-[11px] text-muted-foreground">—</span>
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={baixar}
          disabled={busy}
          className="mt-10 inline-flex rounded-full bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "[ PREPARANDO… ]" : "[ BAIXAR EXTENSÃO (.ZIP) → ]"}
        </button>

        <h2 className="mt-14 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Como instalar
        </h2>
        <ol className="mt-4 space-y-3">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-4 font-serif text-[15px]">
              <span className="font-mono text-[11px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <p className="mt-10 font-serif text-[13px] italic text-muted-foreground pb-20">
          A extensão não coleta nem envia dados: toda a leitura acontece na sua própria aba.
        </p>
      </main>
    </div>

  );
}
