/**
 * Função injetada na aba ativa. Precisa ser autocontida (sem imports).
 * Espelha as regras de src/lib/brand-utils.ts.
 */
function coraScanPage() {
  function parseColor(value) {
    const v = String(value || "").trim().toLowerCase();
    const hex = v.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: 1,
      };
    }
    const rgb = v.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?/);
    if (rgb) {
      return {
        r: Number(rgb[1]),
        g: Number(rgb[2]),
        b: Number(rgb[3]),
        a: rgb[4] === undefined ? 1 : Number(rgb[4]),
      };
    }
    return null;
  }

  function toHex(c) {
    const p = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return "#" + p(c.r) + p(c.g) + p(c.b);
  }

  function luminance(c) {
    const ch = (v) => {
      const n = v / 255;
      return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }

  function distance(a, b) {
    const ca = parseColor(a);
    const cb = parseColor(b);
    if (!ca || !cb) return Infinity;
    return Math.sqrt((ca.r - cb.r) ** 2 + (ca.g - cb.g) ** 2 + (ca.b - cb.b) ** 2);
  }

  const counts = new Map();
  function bump(raw, weight) {
    const c = parseColor(raw);
    if (!c || c.a < 0.25) return;
    const hex = toHex(c);
    counts.set(hex, (counts.get(hex) || 0) + weight);
  }

  const fontFamilies = new Map();
  const sizes = new Set();
  const nodes = Array.from(document.querySelectorAll("body *")).slice(0, 2500);

  for (const el of nodes) {
    const rect = el.getBoundingClientRect();
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none") continue;

    if (area > 0) bump(st.backgroundColor, Math.min(4000, area / 500) + 1);
    const hasText = el.childNodes.length && Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent && n.textContent.trim().length > 1,
    );
    if (hasText) {
      bump(st.color, 6);
      const fam = (st.fontFamily.split(",")[0] || "").replace(/["']/g, "").trim();
      if (fam) fontFamilies.set(fam, (fontFamilies.get(fam) || 0) + 1);
      const size = parseFloat(st.fontSize);
      if (size) sizes.add(Math.round(size * 10) / 10);
    }
    if (st.borderTopWidth !== "0px") bump(st.borderTopColor, 1);
  }

  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  const palette = [];
  for (const hex of ranked) {
    if (palette.length >= 8) break;
    if (palette.every((kept) => distance(kept, hex) > 24)) palette.push(hex);
  }
  palette.sort((a, b) => luminance(parseColor(a)) - luminance(parseColor(b)));

  const scale = Array.from(sizes).sort((a, b) => a - b).filter((size, i, arr) =>
    i === 0 || size - arr[i - 1] > 1,
  );

  const fonts = Array.from(fontFamilies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  function abs(src) {
    if (!src) return null;
    try {
      return new URL(src, location.href).toString();
    } catch {
      return null;
    }
  }

  const og = document.querySelector('meta[property="og:image"]');
  const headerImg = document.querySelector(
    'header img, [class*="logo"] img, img[alt*="logo" i], img[class*="logo" i]',
  );
  const iconLink = document.querySelector('link[rel~="icon"], link[rel="apple-touch-icon"]');

  const headings = Array.from(document.querySelectorAll("h1, h2, p"))
    .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 24 && t.length < 240)
    .slice(0, 5);

  const bg = getComputedStyle(document.body).backgroundColor;

  return {
    url: location.href,
    host: location.hostname.replace(/^www\./, ""),
    title: document.title,
    description:
      (document.querySelector('meta[name="description"]') || {}).content || "",
    background: parseColor(bg) ? toHex(parseColor(bg)) : "#FFFFFF",
    palette,
    fonts,
    scale,
    logo: abs(headerImg && headerImg.src) || abs(og && og.content) || abs(iconLink && iconLink.href),
    voice: headings,
  };
}
