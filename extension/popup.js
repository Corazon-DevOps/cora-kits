const APP_URL = "https://cora-kits.lovable.app";

const el = (id) => document.getElementById(id);
let result = null;

function setStatus(message) {
  el("status").textContent = message || "";
}

async function copy(text, ok) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(ok);
  } catch {
    setStatus("Não foi possível copiar.");
  }
}

function render(data) {
  result = data;
  el("title").textContent = data.title || data.host || "Página sem título";
  el("host").textContent = data.host || data.url || "";
  el("content").hidden = false;

  const swatches = el("swatches");
  swatches.innerHTML = "";
  for (const hex of data.palette) {
    const button = document.createElement("button");
    button.className = "swatch";
    button.title = `Copiar ${hex}`;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.style.background = hex;
    const label = document.createElement("span");
    label.className = "hex";
    label.textContent = hex.toUpperCase();
    button.append(chip, label);
    button.addEventListener("click", () => copy(hex, `${hex.toUpperCase()} copiado.`));
    swatches.appendChild(button);
  }

  const fonts = el("fonts");
  fonts.innerHTML = "";
  if (!data.fonts.length) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma família detectada.";
    fonts.appendChild(li);
  }
  for (const font of data.fonts) {
    const li = document.createElement("li");
    li.textContent = font;
    li.style.fontFamily = font;
    fonts.appendChild(li);
  }

  el("scale").textContent = data.scale.length
    ? data.scale.map((n) => `${n}px`).join(" · ")
    : "—";

  if (data.logo) {
    el("logoLabel").hidden = false;
    el("logo").hidden = false;
    el("logo").src = data.logo;
  }
}

function tokensJson() {
  if (!result) return "{}";
  return JSON.stringify(
    {
      fonte: result.url,
      marca: result.host,
      titulo: result.title,
      descricao: result.description,
      fundo: result.background,
      paleta: result.palette,
      tipografia: result.fonts,
      escala: result.scale,
      logo: result.logo,
      voz: result.voice,
    },
    null,
    2,
  );
}

function tokensCss() {
  if (!result) return "";
  const colors = result.palette
    .map((hex, i) => `  --brand-${i + 1}: ${hex};`)
    .join("\n");
  const fonts = result.fonts
    .map((font, i) => `  --brand-font-${i + 1}: "${font}";`)
    .join("\n");
  return `/* ${result.host} — extraído com Cora Extrator */\n:root {\n${colors}\n${fonts}\n}`;
}

async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !/^https?:/.test(tab.url || "")) {
      el("title").textContent = "Abra um site";
      el("host").textContent = "A extensão funciona em páginas http e https.";
      return;
    }
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: coraScanPage,
    });
    if (!injection || !injection.result) throw new Error("sem resultado");
    render(injection.result);
  } catch {
    el("title").textContent = "Não foi possível ler";
    el("host").textContent = "Recarregue a página e tente novamente.";
  }
}

el("copyJson").addEventListener("click", () => copy(tokensJson(), "Tokens JSON copiados."));
el("copyCss").addEventListener("click", () => copy(tokensCss(), "Variáveis CSS copiadas."));
el("openApp").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = (result && result.url) || (tab && tab.url) || "";
  chrome.tabs.create({ url: `${APP_URL}/?url=${encodeURIComponent(url)}` });
});

init();
