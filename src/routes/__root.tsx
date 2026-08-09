import { useEffect } from "react";
import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useNavigate,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SiteFooter } from "@/components/site-footer";

import { SmoothScroll } from "@/components/smooth-scroll";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}


export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cora Extrator — extraia a identidade visual de qualquer site" },
      {
        name: "description",
        content:
          "Cores, tipografia, voz e tokens extraídos de qualquer site em segundos. Pronto para usar no seu próximo projeto.",
      },
      {
        name: "keywords",
        content:
          "identidade visual, brand kit, design system, extrair cores, tipografia, voz da marca, design tokens",
      },
      { property: "og:title", content: "Cora Extrator" },
      {
        property: "og:description",
        content: "Cores, tipografia, voz e tokens extraídos de qualquer site em segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cora Extrator" },
      {
        name: "twitter:description",
        content: "Cores, tipografia, voz e tokens extraídos de qualquer site em segundos.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },

      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function PostLoginRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    let dest: string | null = null;
    try {
      dest = sessionStorage.getItem("cora:pos-login");
      if (dest) sessionStorage.removeItem("cora:pos-login");
    } catch {
      /* ignore */
    }
    if (!dest || !dest.startsWith("/") || dest.startsWith("//")) return;
    if (dest === window.location.pathname) return;
    navigate({ to: dest, replace: true });
  }, [loading, user, navigate]);

  return null;
}

function RootComponent() {
  return (
    <AuthProvider>
      <SmoothScroll />
      <PostLoginRedirect />
      <Outlet />
      <SiteFooter />
      <Toaster />
    </AuthProvider>
  );
}

