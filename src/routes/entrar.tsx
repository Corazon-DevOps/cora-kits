import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/oauth";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/entrar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — Cora Extrator" },
      {
        name: "description",
        content:
          "Acesse sua conta do Cora Extrator para extrair cores, tipografia, voz e tokens de qualquer site.",
      },
      { property: "og:title", content: "Entrar — Cora Extrator" },
      {
        property: "og:description",
        content: "Acesse sua conta do Cora Extrator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().trim().email({ message: "E-mail inválido" }).max(255),
  password: z
    .string()
    .min(8, { message: "A senha precisa ter ao menos 8 caracteres" })
    .max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/entrar" });
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const dest = safePath(search.redirect) ?? "/";

  useEffect(() => {
    if (!loading && user) navigate({ to: dest, replace: true });
  }, [loading, user, dest, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setBusy(true);
    try {
      if (mode === "criar") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setSent(true);
        toast.success("Confira seu e-mail para confirmar a conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta.");
      }
    } catch (err: any) {
      toast.error(traduzErro(err?.message));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      const result = await signInWithGoogle(dest);
      if (!result.ok) {
        toast.error(traduzErro(result.message) || "Não foi possível entrar com o Google.");
        return;
      }
      // Fluxo de redirect: o navegador sai desta página.
      if (result.redirected) return;
      // Fluxo em popup: a sessão já foi definida — confirme e navegue.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        toast.success("Bem-vindo!");
        navigate({ to: dest, replace: true });
      } else {
        toast.error("Login com Google não concluído. Tente novamente.");
      }
    } catch (err: any) {
      toast.error(traduzErro(err?.message) || "Não foi possível entrar com o Google.");
    } finally {
      setBusy(false);
    }
  }



  async function onForgot() {
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Informe seu e-mail para receber o link de redefinição.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) toast.error(traduzErro(error.message));
    else toast.success("Enviamos um link de redefinição para seu e-mail.");
  }

  return (
    <>
      <style>{css}</style>
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="auth-brand">Cora Extrator</Link>

          <h1 className="auth-title">
            {mode === "entrar" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="auth-lede">
            {mode === "entrar"
              ? "Acesse sua conta para extrair identidades visuais."
              : "Crie sua conta — o Cora Extrator é gratuito."}
          </p>

          {sent ? (
            <p className="auth-note">
              Enviamos um e-mail de confirmação para <strong>{email}</strong>. Clique no link
              para ativar sua conta e voltar aqui.
            </p>
          ) : (
            <form className="auth-form" onSubmit={onSubmit}>
              <label className="auth-label" htmlFor="email">E-mail</label>
              <input
                id="email"
                className="auth-input"
                type="email"
                autoComplete="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />

              <label className="auth-label" htmlFor="senha">Senha</label>
              <input
                id="senha"
                className="auth-input"
                type="password"
                autoComplete={mode === "criar" ? "new-password" : "current-password"}
                value={password}
                maxLength={72}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo de 8 caracteres"
                required
              />

              <button className="auth-submit" type="submit" disabled={busy}>
                {busy ? "[ AGUARDE… ]" : mode === "entrar" ? "[ ENTRAR → ]" : "[ CRIAR CONTA → ]"}
              </button>
            </form>
          )}

          <div className="auth-divider"><span>ou</span></div>

          <button type="button" className="auth-google" onClick={onGoogle} disabled={busy}>
            Continuar com o Google
          </button>

          <div className="auth-foot">
            {mode === "entrar" ? (
              <>
                <button type="button" onClick={() => setMode("criar")}>
                  Não tem conta? Criar agora
                </button>
                <button type="button" onClick={onForgot}>Esqueci minha senha</button>
              </>
            ) : (
              <button type="button" onClick={() => setMode("entrar")}>
                Já tenho conta — entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function safePath(value?: string): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function traduzErro(msg?: string): string {
  if (!msg) return "Algo deu errado. Tente novamente.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("user already registered")) return "Este e-mail já tem uma conta. Faça login.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("password")) return "Senha inválida ou muito fraca.";
  return msg;
}

const css = `
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 20px;
    background: #F4EFE6;
    color: #0A0A0A;
  }
  .auth-card {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border: 1px solid rgba(10,10,10,0.18);
    border-radius: 24px;
    background: rgba(249,246,240,0.6);
    padding: 32px 28px;
    box-shadow: 0 18px 50px -30px rgba(10,10,10,0.4);
  }
  .auth-brand {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #0A0A0A;
    text-decoration: none;
  }
  .auth-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: 44px;
    line-height: 1;
    margin: 8px 0 0;
  }
  .auth-lede {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-style: italic;
    font-size: 14px;
    color: rgba(10,10,10,0.7);
    margin: 0 0 8px;
  }
  .auth-note {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 14px;
    line-height: 1.55;
    color: rgba(10,10,10,0.75);
  }
  .auth-form { display: flex; flex-direction: column; gap: 6px; }
  .auth-label {
    font-family: 'Courier Prime', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(10,10,10,0.6);
    margin-top: 8px;
  }
  .auth-input {
    font-family: 'Courier Prime', monospace;
    font-size: 14px;
    padding: 12px 14px;
    border: 1px solid rgba(10,10,10,0.2);
    border-radius: 999px;
    background: rgba(255,255,255,0.55);
    outline: 0;
  }
  .auth-input:focus { border-color: rgba(10,10,10,0.5); }
  .auth-submit {
    margin-top: 16px;
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    padding: 14px 20px;
    border: 0;
    border-radius: 999px;
    background: #0A0A0A;
    color: #F4EFE6;
    cursor: pointer;
  }
  .auth-submit:disabled { opacity: 0.6; cursor: progress; }
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Courier Prime', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(10,10,10,0.45);
  }
  .auth-divider::before,
  .auth-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(10,10,10,0.15);
  }
  .auth-google {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 13px 20px;
    border: 1px solid rgba(10,10,10,0.25);
    border-radius: 999px;
    background: rgba(255,255,255,0.7);
    cursor: pointer;
  }
  .auth-google:hover { border-color: rgba(10,10,10,0.5); }
  .auth-foot {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 6px;
  }
  .auth-foot button {
    background: none;
    border: 0;
    padding: 0;
    text-align: left;
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: rgba(10,10,10,0.65);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .auth-foot button:hover { color: #8B1A1A; }
`;
