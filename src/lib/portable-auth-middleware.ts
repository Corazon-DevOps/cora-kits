import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const requirePortableAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url =
      process.env["SUPABASE_URL"] ||
      process.env["VITE_SUPABASE_URL"] ||
      "https://pbomfcmjscpmediuhwms.supabase.co";
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["SUPABASE_ANON_KEY"] ||
      "sb_publishable_-53k5QsgArQA7yeAuKcJog_NSCGcCDJ";
    const authorization = getRequest().headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      throw new Error("Faça login para continuar");
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token || token.split(".").length !== 3) {
      throw new Error("Sessão inválida. Entre novamente");
    }

    const supabase = createClient<Database>(url, key, {
      global: {
        fetch: (input, init) => {
          const headers = new Headers(
            typeof Request !== "undefined" && input instanceof Request
              ? input.headers
              : undefined,
          );
          if (init?.headers) {
            new Headers(init.headers).forEach((value, name) => headers.set(name, value));
          }
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase.auth.getClaims(token);
    const userId = data?.claims?.sub;
    if (error || !userId) {
      throw new Error("Sessão expirada. Entre novamente");
    }

    return next({
      context: {
        supabase,
        userId,
        claims: data.claims,
      },
    });
  },
);