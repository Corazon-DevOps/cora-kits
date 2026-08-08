import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Cora Extrator" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta do Cora Extrator.",
      },
      { property: "og:title", content: "Redefinir senha — Cora Extrator" },
      {
        property: "og:description",
        content: "Defina uma nova senha para sua conta do Cora Extrator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z
      .string()
      .min(8, { message: "A senha precisa ter ao menos 8 caracteres" })
      .max(72)
      .safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Senha inválida");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível atualizar a senha. Solicite um novo link.");
      return;
    }
    toast.success("Senha atualizada.");
    navigate({ to: "/", replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F4EFE6",
        padding: "48px 20px",
        color: "#0A0A0A",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          border: "1px solid rgba(10,10,10,0.18)",
          borderRadius: 24,
          padding: "32px 28px",
          background: "rgba(249,246,240,0.6)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 40,
            margin: 0,
          }}
        >
          Nova senha
        </h1>
        <p
          style={{
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontStyle: "italic",
            fontSize: 14,
            color: "rgba(10,10,10,0.7)",
            margin: "0 0 8px",
          }}
        >
          Escolha uma senha com no mínimo 8 caracteres.
        </p>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          maxLength={72}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="nova senha"
          required
          aria-label="Nova senha"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 14,
            padding: "12px 14px",
            border: "1px solid rgba(10,10,10,0.2)",
            borderRadius: 999,
            background: "rgba(255,255,255,0.55)",
            outline: 0,
          }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 10,
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            padding: "14px 20px",
            border: 0,
            borderRadius: 999,
            background: "#0A0A0A",
            color: "#F4EFE6",
            cursor: "pointer",
          }}
        >
          {busy ? "[ SALVANDO… ]" : "[ SALVAR SENHA → ]"}
        </button>
      </form>
    </div>
  );
}
