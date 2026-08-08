import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

/**
 * O broker gerenciado do Lovable (`/~oauth/*`) só existe em origens servidas
 * pelo Lovable (preview, *.lovable.app e domínios personalizados conectados no
 * Lovable). Em qualquer outro host — Vercel, Netlify, self-host — usamos o
 * fluxo direto do Supabase Auth, que funciona em qualquer origem desde que ela
 * esteja na lista de URLs de redirecionamento do projeto.
 */
export function isLovableOrigin(host = window.location.hostname): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com")
  );
}

export type GoogleSignInResult =
  | { ok: true; redirected: boolean }
  | { ok: false; message?: string };

export async function signInWithGoogle(dest: string): Promise<GoogleSignInResult> {
  const origin = window.location.origin;
  const callback = `${origin}/entrar?redirect=${encodeURIComponent(dest)}`;

  try {
    sessionStorage.setItem("cora:pos-login", dest);
  } catch {
    /* ignore */
  }

  if (!isLovableOrigin()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, redirected: true };
  }

  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: origin,
  });
  if (result.error) return { ok: false, message: result.error.message };
  return { ok: true, redirected: Boolean(result.redirected) };
}
