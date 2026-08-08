import { lovable } from "@/integrations/lovable/index";

export type GoogleSignInResult =
  | { ok: true; redirected: boolean }
  | { ok: false; message?: string };

/**
 * O login com Google usa sempre o broker gerenciado. As credenciais OAuth são
 * gerenciadas pela plataforma, então o fluxo direto do Supabase Auth falha com
 * "missing OAuth secret" — inclusive em domínios próprios (Vercel, Netlify).
 */
export async function signInWithGoogle(dest: string): Promise<GoogleSignInResult> {
  try {
    sessionStorage.setItem("cora:pos-login", dest);
  } catch {
    /* ignore */
  }

  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });
  if (result.error) return { ok: false, message: result.error.message };
  return { ok: true, redirected: Boolean(result.redirected) };
}
