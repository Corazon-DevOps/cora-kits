import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/start-here")({
  head: () => ({
    meta: [
      { title: "Comece aqui — Cora Extrator" },
      {
        name: "description",
        content:
          "Como usar este template Cora Extrator: extraia qualquer marca de uma URL, conecte o Firecrawl para resultados mais ricos e limpe tudo quando terminar.",
      },
    ],
  }),
  component: StartHerePage,
});

const CONNECT_FIRECRAWL_PROMPT = `Conecte o conector Firecrawl a este projeto para que a extração de URL possa usá-lo em sites com muito JavaScript.`;

const REMOVE_PROMPT = `Remova o botão "Start Here" da barra de navegação e apague a rota /start-here. Apague também src/components/start-here-button.tsx e src/routes/start-here.tsx. Mantenha o restante como está.`;

function StartHerePage() {
  return (
    <div style={{ background: "#F4EFE6", color: "#0A0A0A", minHeight: "100vh" }}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
        <Eyebrow>// Guia do template</Eyebrow>
        <h1
          className="mt-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(44px, 6vw, 72px)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          Comece <em style={{ fontStyle: "italic", fontWeight: 400 }}>aqui.</em>
        </h1>

        <Divider />

        <Section number="01." title="O que este template faz">
          <P>
            Cole a URL de qualquer empresa. O app extrai a paleta,
            tipografia, voz e tokens de design da marca — e os organiza como
            um kit que você pode navegar, compartilhar e exportar.
          </P>
          <P>
            Os kits recentes aparecem na página inicial. Abra um para ver
            cores, fontes, logos e um <Mono>design.md</Mono> gerado.
          </P>
          <P>
            Solte esses arquivos no Lovable ou no seu agente de IA para usar
            a marca dele.
          </P>
        </Section>

        <Section number="02." title="Opcional: conector Firecrawl">
          <FirecrawlCard />
          <P>
            A extração funciona sem ele. Adicionar o Firecrawl traz
            resultados melhores em sites com muito JavaScript e dados de
            marca mais ricos.
          </P>

          <SubHeading>Preço — praticamente grátis</SubHeading>
          <P>
            O Firecrawl dá a cada nova conta <strong>500 créditos grátis</strong>{" "}
            no cadastro, sem precisar de cartão. Uma extração de marca
            costuma usar de 1 a 5 créditos, então o uso casual raramente sai
            do plano gratuito. Se acabarem, o plano Hobby começa em{" "}
            <strong>US$ 16/mês</strong> para 3.000 créditos — necessário só
            para uso intenso ou comercial.
          </P>

          <SubHeading>Conectando</SubHeading>
          <P>
            <strong>Se você fez um remix deste template,</strong> o Lovable
            pode já ter vinculado o Firecrawl. Se não tiver certeza, cole
            isto no chat do Lovable:
          </P>
          <PromptBlock text={CONNECT_FIRECRAWL_PROMPT} />
          <P style={{ marginTop: 16 }}>
            O Lovable abrirá o seletor de conectores. Escolha uma conexão
            Firecrawl existente ou crie uma. Não é preciso alterar código.
          </P>
        </Section>

        <Section number="03." title="Quando terminar este guia">
          <P>
            Depois de se orientar, você pode remover o botão Start Here e
            esta página. Cole isto no chat do Lovable:
          </P>
          <PromptBlock text={REMOVE_PROMPT} />
          <P style={{ marginTop: 16, fontSize: 13, color: "rgba(10,10,10,0.6)" }}>
            Você sempre pode restaurá-la depois pedindo ao Lovable para
            adicionar a página Start Here de volta.
          </P>
        </Section>

        <Divider />

        <div className="flex items-center justify-between">
          <Link
            to="/"
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#0A0A0A",
              textDecoration: "none",
              borderBottom: "1px solid #0A0A0A",
              paddingBottom: 2,
            }}
          >
            ← Voltar para extrair
          </Link>
          <span
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(10,10,10,0.45)",
            }}
          >
            Cora Extrator / v1.0
          </span>
        </div>
      </main>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Courier Prime', monospace",
        fontSize: 11,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(10,10,10,0.55)",
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <hr
      style={{
        border: 0,
        borderTop: "1px solid rgba(10,10,10,0.2)",
        margin: "56px 0",
      }}
    />
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 48 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "56px 1fr",
          gap: 16,
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "rgba(10,10,10,0.55)",
          }}
        >
          {number}
        </span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 28,
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ marginLeft: 72, marginTop: 16 }}>{children}</div>
    </section>
  );
}

function P({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontFamily: "'Libre Baskerville', serif",
        fontSize: 15,
        lineHeight: 1.65,
        color: "rgba(10,10,10,0.82)",
        margin: "12px 0",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "'Courier Prime', monospace",
        fontSize: 13,
        background: "rgba(10,10,10,0.06)",
        padding: "2px 6px",
      }}
    >
      {children}
    </code>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: "'Courier Prime', monospace",
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(10,10,10,0.55)",
        margin: "28px 0 4px",
      }}
    >
      {children}
    </h3>
  );
}

function FirecrawlCard() {
  return (
    <div
      style={{
        marginTop: 8,
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        border: "1px solid rgba(10,10,10,0.2)",
        background: "#F9F6F0",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          background: "#0A0A0A",
          color: "#FF6B35",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 20,
          lineHeight: 1,
        }}
      >
        🔥
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1,
            color: "#0A0A0A",
          }}
        >
          Firecrawl
        </span>
        <span
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(10,10,10,0.55)",
          }}
        >
          Extração de sites · 500 créditos grátis
        </span>
      </div>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid rgba(10,10,10,0.12)",
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: 11,
          color: "rgba(10,10,10,0.55)",
          letterSpacing: "0.14em",
        }}
      >
        0{n}
      </span>
      <span
        style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 15,
          lineHeight: 1.55,
          color: "#0A0A0A",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function PromptBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };
  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid rgba(10,10,10,0.2)",
        background: "#EDE8DE",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          borderBottom: "1px solid rgba(10,10,10,0.12)",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(10,10,10,0.55)",
        }}
      >
        <span>Prompt — cole no chat do Lovable</span>
        <button
          onClick={onCopy}
          aria-label="Copiar prompt"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: copied ? "#1f6b3a" : "#0A0A0A",
          }}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" strokeWidth={2} /> Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" strokeWidth={1.5} /> Copiar
            </>
          )}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "14px 16px",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 13,
          lineHeight: 1.55,
          color: "#0A0A0A",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {text}
      </pre>
    </div>
  );
}