/**
 * Utilidades de marca — funções puras usadas pelo app e espelhadas na extensão.
 */

/* ---------- URL / domínio ---------- */

export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isValidUrl(input: string): boolean {
  return normalizeUrl(input) !== null;
}

export function domainOf(input: string): string | null {
  const normalized = normalizeUrl(input);
  if (!normalized) return null;
  return new URL(normalized).hostname.replace(/^www\./, "");
}

/** "loja-da-ana.com.br" -> "Loja Da Ana" */
export function brandNameFromUrl(input: string): string | null {
  const domain = domainOf(input);
  if (!domain) return null;
  const base = domain.split(".")[0] ?? domain;
  return base
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* ---------- Cor ---------- */

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

export function parseColor(value: string): Rgb | null {
  const v = value.trim().toLowerCase();
  const hex = v.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    let h = hex[1]!;
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const rgb = v.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }
  return null;
}

export function toHex({ r, g, b }: Rgb): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return 1;
  const la = relativeLuminance(ca);
  const lb = relativeLuminance(cb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/** Nível WCAG do contraste entre duas cores para texto normal. */
export function wcagLevel(a: string, b: string): "AAA" | "AA" | "AA Grande" | "Reprovado" {
  const ratio = contrastRatio(a, b);
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Grande";
  return "Reprovado";
}

/** Cor de texto legível (preto ou branco) sobre o fundo informado. */
export function readableTextColor(background: string): "#0A0A0A" | "#FFFFFF" {
  const rgb = parseColor(background);
  if (!rgb) return "#0A0A0A";
  return relativeLuminance(rgb) > 0.45 ? "#0A0A0A" : "#FFFFFF";
}

export function colorDistance(a: string, b: string): number {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return Number.POSITIVE_INFINITY;
  return Math.sqrt((ca.r - cb.r) ** 2 + (ca.g - cb.g) ** 2 + (ca.b - cb.b) ** 2);
}

/** Remove cores praticamente iguais (distância euclidiana em RGB). */
export function dedupeColors(colors: string[], threshold = 24): string[] {
  const out: string[] = [];
  for (const color of colors) {
    const rgb = parseColor(color);
    if (!rgb) continue;
    const hex = toHex(rgb);
    if (out.every((kept) => colorDistance(kept, hex) > threshold)) out.push(hex);
  }
  return out;
}

/** Ordena a paleta do mais escuro para o mais claro. */
export function sortByLuminance(colors: string[]): string[] {
  return [...colors].sort((a, b) => {
    const ra = parseColor(a);
    const rb = parseColor(b);
    if (!ra || !rb) return 0;
    return relativeLuminance(ra) - relativeLuminance(rb);
  });
}

/* ---------- Tipografia ---------- */

/** Deriva uma escala tipográfica ordenada e sem duplicatas próximas. */
export function inferTypeScale(sizes: number[], tolerance = 1): number[] {
  const clean = sizes
    .filter((n) => Number.isFinite(n) && n >= 8 && n <= 200)
    .map((n) => Math.round(n * 10) / 10)
    .sort((a, b) => a - b);
  const out: number[] = [];
  for (const size of clean) {
    if (!out.length || size - out[out.length - 1]! > tolerance) out.push(size);
  }
  return out;
}

/** Razão média entre passos consecutivos da escala (ex.: 1.25). */
export function typeScaleRatio(scale: number[]): number | null {
  if (scale.length < 2) return null;
  const ratios: number[] = [];
  for (let i = 1; i < scale.length; i += 1) ratios.push(scale[i]! / scale[i - 1]!);
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return Math.round(avg * 100) / 100;
}

/** Primeira família real de uma declaração font-family. */
export function primaryFontFamily(fontFamily: string): string {
  return (fontFamily.split(",")[0] ?? "")
    .replace(/["']/g, "")
    .trim();
}

/* ---------- Tokens ---------- */

export function toCssVariables(
  colors: string[],
  prefix = "brand",
): string {
  const lines = colors.map((c, i) => `  --${prefix}-${i + 1}: ${c};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

/* ---------- Formatação / navegador ---------- */

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadTextFile(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha no download: ${res.status}`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}
