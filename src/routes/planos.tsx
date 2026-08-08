import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { getEntitlement } from "@/lib/entitlements.functions";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Plano e assinatura — Cora Extrator" },
      {
        name: "description",
        content:
          "Assine o Cora Extrator por R$ 15 por mês e extraia cores, tipografia, voz e tokens de quantos sites quiser.",
      },
      { property: "og:title", content: "Plano e assinatura — Cora Extrator" },
      {
        property: "og:description",
        content: "R$ 15 por mês, extrações ilimitadas. A primeira extração é gratuita.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planos,
});

type Entitlement = {
  subscribed: boolean;
  extractionsUsed: number;
  freeLimit: number;
  canExtract: boolean;
  currentPeriodEnd: string | null;
};

function Planos() {
  const { user, loading } = useAuth();
  const fetchEntitlement = useServerFn(getEntitlement);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);

  useEffect(() => {
    if (!user) {
      setEntitlement(null);
      return;
    }
    let cancelled = false;
    fetchEntitlement()
      .then((e) => {
        if (!cancelled) setEntitlement(e as Entitlement);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, fetchEntitlement]);


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Plano
        </p>
        <h1 className="mt-5 font-display text-5xl font-light leading-none">
          R$ 15 <span className="text-2xl text-muted-foreground">/ mês</span>
        </h1>
        <p className="mt-4 max-w-md font-serif text-base italic text-muted-foreground">
          Extrações ilimitadas de identidade visual, exportações completas e histórico salvo na
          sua biblioteca. Cancele quando quiser.
        </p>

        <ul className="mt-10 border-t border-foreground/15">
          {[
            "Extrações ilimitadas de sites e arquivos",
            "Paleta, tipografia, voz e design tokens",
            "Exportação em CSS, Tailwind, JSON e PDF",
            "Biblioteca com todos os kits salvos",
            "Cancelamento a qualquer momento",
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
          {!user ? (
            <>
              <p className="font-serif text-[15px]">
                Crie sua conta para começar. A primeira extração é gratuita.
              </p>
              <Link
                to="/entrar"
                search={{ redirect: "/planos" }}
                className="mt-5 inline-flex rounded-full bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-background"
              >
                [ CRIAR CONTA → ]
              </Link>
            </>
          ) : entitlement?.subscribed ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Assinatura ativa
              </p>
              <p className="mt-3 font-serif text-[15px]">
                Sua assinatura está ativa
                {entitlement.currentPeriodEnd
                  ? ` até ${new Date(entitlement.currentPeriodEnd).toLocaleDateString("pt-BR")}`
                  : ""}
                . Extrações ilimitadas liberadas.
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {loading
                  ? "Carregando…"
                  : (entitlement?.extractionsUsed ?? 0) < (entitlement?.freeLimit ?? 1)
                    ? "Você ainda tem 1 extração gratuita"
                    : "Extração gratuita usada"}
              </p>
              <p className="mt-3 font-serif text-[15px]">
                Assine por R$ 15/mês para extrair sem limites.
              </p>
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Estamos concluindo a ativação do pagamento. Em instantes você poderá assinar por aqui.",
                  )
                }
                className="mt-5 inline-flex rounded-full bg-foreground px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-background"
              >
                [ ASSINAR R$ 15/MÊS → ]
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
