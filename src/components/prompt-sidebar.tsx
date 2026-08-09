import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listKitsByOwner } from "@/lib/kits.functions";
import { getAnonToken, getAnonTokenHistory } from "@/lib/anon";
import { readKitsCache, writeKitsCache } from "@/lib/kits-cache";
import { renderFamilyFor } from "@/lib/font-loader";
import { Search, History } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Kit = {
  id: string;
  name: string;
  source_url: string | null;
  status: string;
  created_at: string;
  primaryHex: string | null;
  palette?: string[];
  displayFont?: {
    family: string;
    google: boolean;
    source_family?: string | null;
    weights?: string[] | null;
    file_urls?: Array<{ url: string; weight?: string; style?: string; format?: string }> | null;
  } | null;
  logoUrl?: string | null;
};

interface PromptSidebarProps {
  onSelect?: (url: string) => void;
  activeUrl?: string | null;
}

export function PromptSidebar({ onSelect, activeUrl }: PromptSidebarProps) {
  const list = useServerFn(listKitsByOwner);
  const [kits, setKits] = useState<Kit[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ownerToken = typeof window !== "undefined" ? getAnonToken() : "";
    if (!ownerToken) {
      setLoading(false);
      return;
    }

    const cached = readKitsCache();
    if (cached && cached.length > 0) {
      setKits(cached as Kit[]);
    }

    (async () => {
      try {
        const res = await list({
          data: { ownerToken, ownerTokens: getAnonTokenHistory() },
        });
        const next = (res.kits as Kit[]) ?? [];
        if (next.length > 0 || (cached?.length ?? 0) === 0) {
          setKits(next);
          writeKitsCache(next);
        }
      } catch (e) {
        console.error("Failed to load kits for sidebar", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [list]);

  const filtered = kits.filter(
    (k) =>
      k.name.toLowerCase().includes(q.toLowerCase()) ||
      (k.source_url ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-foreground/10 bg-card/30 flex flex-col shrink-0 h-[calc(100vh-64px)] overflow-hidden hidden lg:flex">
      <div className="p-6 border-bottom border-foreground/5">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Sua Biblioteca
          </h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Filtrar sites..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-background/50 border border-foreground/10 rounded-full py-2 pl-9 pr-4 font-mono text-[10px] outline-none focus:border-foreground/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
        {loading && kits.length === 0 ? (
          <div className="px-3 py-4 font-serif italic text-[14px] text-muted-foreground">
            Carregando biblioteca...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-4 font-serif italic text-[14px] text-muted-foreground">
            {q ? "Nenhum resultado." : "Nenhum site extraído ainda."}
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((k) => {
              const isActive = k.source_url === activeUrl;
              return (
                <li key={k.id}>
                  <button
                    onClick={() => k.source_url && onSelect?.(k.source_url)}
                    className={`w-full text-left group flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-foreground text-background" 
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    <div 
                      className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-foreground/10 overflow-hidden"
                      style={{ 
                        background: k.primaryHex 
                          ? `color-mix(in oklab, ${k.primaryHex} 12%, #F4EFE6)` 
                          : "rgba(10,10,10,0.04)"
                      }}
                    >
                      {k.logoUrl ? (
                        <img src={k.logoUrl} alt="" className="h-7 w-7 object-contain" />
                      ) : (
                        <span className="font-serif text-[18px]" style={{ color: k.primaryHex || 'inherit' }}>
                          {k.name[0]}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div 
                        className="truncate text-[15px] font-medium leading-tight"
                        style={{
                          fontFamily: (() => {
                            const fam = renderFamilyFor({
                              family: k.displayFont?.family ?? null,
                              source_family: k.displayFont?.source_family ?? null,
                              file_urls: k.displayFont?.file_urls ?? null,
                              google_font: k.displayFont?.google ?? null,
                            });
                            return fam ? `'${fam}', 'Cormorant Garamond', serif` : "'Cormorant Garamond', serif";
                          })(),
                        }}
                      >
                        {k.name}
                      </div>
                      {k.source_url && (
                        <div className={`truncate font-mono text-[9px] uppercase tracking-wider opacity-60`}>
                          {k.source_url.replace(/^https?:\/\//, "")}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <div className="p-4 border-t border-foreground/5">
        <Link 
          to="/library" 
          className="block w-full text-center py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          [ Gerenciar Biblioteca ]
        </Link>
      </div>
    </aside>
  );
}
