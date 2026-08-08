// Supabase client for server functions — server-only.
//
// Usa apenas chaves públicas (URL + publishable key) e repassa o token do
// usuário logado, então o acesso é feito com as políticas de RLS do próprio
// usuário. Isso permite rodar o backend em qualquer host (Lovable, Vercel,
// Netlify, self-host) sem precisar da chave de serviço.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRequestHeader } from "@tanstack/react-start/server";

// Valores públicos (podem ficar no código) usados como fallback quando o host
// não define as variáveis de ambiente do servidor.
const FALLBACK_URL = "https://pbomfcmjscpmediuhwms.supabase.co";
const FALLBACK_KEY = "sb_publishable_-53k5QsgArQA7yeAuKcJog_NSCGcCDJ";

function readEnv(name: string): string | undefined {
  try {
    return process.env[name] || undefined;
  } catch {
    return undefined;
  }
}

function config() {
  const url = readEnv("SUPABASE_URL") || readEnv("VITE_SUPABASE_URL") || FALLBACK_URL;
  const key =
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("SUPABASE_ANON_KEY") ||
    FALLBACK_KEY;
  return { url, key };
}

function bearer(): string | null {
  try {
    const raw = getRequestHeader("authorization");
    if (!raw) return null;
    const token = raw.replace(/^Bearer\s+/i, "").trim();
    // Chaves publicáveis novas (sb_*) não são JWTs — não servem como sessão.
    if (!token || token.startsWith("sb_")) return null;
    return token;
  } catch {
    return null;
  }
}

/**
 * Cliente Supabase por requisição. Quando existe sessão, as consultas rodam
 * como o usuário logado (RLS). Sem sessão, roda como anônimo (só dados
 * públicos, como kits compartilhados).
 */
export function getAdmin(): SupabaseClient<any, any, any> {
  const { url, key } = config();
  const token = bearer();
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, storage: undefined },
    global: {
      fetch: (input: any, init: any = {}) => {
        const headers = new Headers(init.headers);
        headers.set("apikey", key);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        else if (key.startsWith("sb_")) headers.delete("Authorization");
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getDb = getAdmin;
