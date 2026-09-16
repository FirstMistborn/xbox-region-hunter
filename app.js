const REGIONS = [
  { code: "TR", name: "Turkey", flag: "🇹🇷", locale: "tr-tr", currency: "TRY", giftCard: true },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", locale: "uk-ua", currency: "UAH" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", locale: "es-ar", currency: "ARS", giftCard: true },
  { code: "IN", name: "India", flag: "🇮🇳", locale: "en-in", currency: "INR" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", locale: "en-is", currency: "ISK" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", locale: "ar-kw", currency: "KWD" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", locale: "ar-qa", currency: "QAR" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", locale: "ar-bh", currency: "BHD" },
  { code: "OM", name: "Oman", flag: "🇴🇲", locale: "ar-om", currency: "OMR" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", locale: "pt-br", currency: "BRL", giftCard: true },
  { code: "JP", name: "Japan", flag: "🇯🇵", locale: "ja-jp", currency: "JPY" },
  { code: "CL", name: "Chile", flag: "🇨🇱", locale: "es-cl", currency: "CLP" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", locale: "th-th", currency: "THB" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", locale: "en-nz", currency: "NZD" },
  { code: "CA", name: "Canada", flag: "🇨🇦", locale: "en-ca", currency: "CAD" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", locale: "en-hk", currency: "HKD" },
  { code: "AE", name: "UAE", flag: "🇦🇪", locale: "en-ae", currency: "AED" },
  { code: "US", name: "United States", flag: "🇺🇸", locale: "en-us", currency: "USD" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", locale: "ar-sa", currency: "SAR" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", locale: "es-co", currency: "COP" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", locale: "en-za", currency: "ZAR" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", locale: "sv-se", currency: "SEK" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", locale: "es-mx", currency: "MXN" },
  { code: "AU", name: "Australia", flag: "🇦🇺", locale: "en-au", currency: "AUD" },
  { code: "NO", name: "Norway", flag: "🇳🇴", locale: "nb-no", currency: "NOK" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", locale: "en-gb", currency: "GBP" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", locale: "en-sg", currency: "SGD" },
  { code: "PL", name: "Poland", flag: "🇵🇱", locale: "pl-pl", currency: "PLN" },
  { code: "DE", name: "Germany", flag: "🇩🇪", locale: "de-de", currency: "EUR" },
  { code: "FR", name: "France", flag: "🇫🇷", locale: "fr-fr", currency: "EUR" },
  { code: "ES", name: "Spain", flag: "🇪🇸", locale: "es-es", currency: "EUR" },
  { code: "IT", name: "Italy", flag: "🇮🇹", locale: "it-it", currency: "EUR" },
];

const FEATURED = [
  { id: "9NCJSXWZTP88", title: "Starfield" },
  { id: "9NP1P1WFS0LB", title: "Halo Infinite" },
  { id: "9NKX70BBCDRN", title: "Forza Horizon 5" },
  { id: "9P3J32CTXLRZ", title: "ELDEN RING" },
  { id: "9P8RQH67TTT1", title: "GTA V" },
  { id: "9N8FQ28Z6QX3", title: "Indiana Jones" },
  { id: "9PH9X0760B0T", title: "DOOM: The Dark Ages" },
  { id: "9P2N57MC619K", title: "Sea of Thieves" },
];

const DISPLAY_CURRENCIES = ["USD", "NZD", "AUD", "EUR", "GBP", "CAD", "JPY", "BRL", "INR"];

const state = {
  rates: { USD: 1 },
  displayCurrency: localStorage.getItem("xrh-fx") || "NZD",
  hideGiftCard: false,
  lastRows: [],
  lastGame: null,
};

const $ = (id) => document.getElementById(id);

function slugify(title) {
  return String(title || "game")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "game";
}

function money(amount, currency) {
  if (amount == null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function toDisplay(amount, fromCurrency) {
  const rates = state.rates;
  const from = rates[fromCurrency];
  const to = rates[state.displayCurrency];
  if (!from || !to) return null;
  return (amount / from) * to;
}

async function loadRates() {
  const urls = [
    "https://open.er-api.com/v6/latest/USD",
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.rates) {
        state.rates = data.rates;
        state.rates.USD = 1;
        return;
      }
      if (data.usd) {
        const rates = { USD: 1 };
        for (const [k, v] of Object.entries(data.usd)) rates[k.toUpperCase()] = v;
        state.rates = rates;
        return;
      }
    } catch {
      /* try next */
    }
  }
}

async function searchGames(query) {
  const params = new URLSearchParams({
    market: "US",
    languages: "en-US",
    query,
    productFamilyNames: "Games",
    platformdependencyname: "Windows.Xbox",
    topProducts: "8",
  });
  const res = await fetch(`https://displaycatalog.mp.microsoft.com/v7.0/productFamilies/autosuggest?${params}`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  const out = [];
  const seen = new Set();
  for (const family of data.Results || []) {
    for (const p of family.Products || []) {
      if (p.Type !== "Game" || seen.has(p.ProductId)) continue;
      seen.add(p.ProductId);
      out.push({
        id: p.ProductId,
        title: p.Title,
        image: p.Icon ? (p.Icon.startsWith("http") ? p.Icon : `https:${p.Icon}`) : "",
      });
    }
  }
  return out;
}

function pickPurchasePrice(product) {
  const skus = product.DisplaySkuAvailabilities || [];
  for (const sku of skus) {
    const availabilities = sku.Availabilities || [];
    const purchasable = availabilities.find((a) =>
      (a.Actions || []).includes("Purchase") &&
      ((a.OrderManagementData || {}).Price || {}).ListPrice > 0
    );
    const anyPaid = availabilities.find((a) =>
      ((a.OrderManagementData || {}).Price || {}).ListPrice > 0
    );
    const chosen = purchasable || anyPaid;
    if (!chosen) continue;
    const price = (chosen.OrderManagementData || {}).Price || {};
    return {
      list: price.ListPrice,
      msrp: price.MSRP || price.ListPrice,
      currency: price.CurrencyCode,
      skuTitle: ((sku.Sku || {}).LocalizedProperties || [{}])[0].SkuTitle || "",
    };
  }
  return null;
}

async function fetchRegionPrice(productId, region) {
  const params = new URLSearchParams({
    bigIds: productId,
    market: region.code,
    languages: "en-US",
    actionFilter: "Browse",
  });
  const res = await fetch(`https://displaycatalog.mp.microsoft.com/v7.0/products?${params}`);
  if (!res.ok) throw new Error(region.code);
  const data = await res.json();
  const product = (data.Products || [])[0];
  if (!product) return { region, missing: true };
  const price = pickPurchasePrice(product);
  if (!price) return { region, missing: true };
  const title = ((product.LocalizedProperties || [{}])[0].ProductTitle) || "";
  const images = ((product.LocalizedProperties || [{}])[0].Images) || [];
  const box = images.find((i) => i.ImagePurpose === "Poster" || i.ImagePurpose === "BoxArt") || images[0];
  return {
    region,
    title,
    image: box ? box.Uri : "",
    list: price.list,
    msrp: price.msrp,
    currency: price.currency,
    converted: toDisplay(price.list, price.currency),
    discount: price.msrp && price.list < price.msrp
      ? Math.round((1 - price.list / price.msrp) * 100)
      : 0,
  };
}

async function compareGame(game) {
  const result = $("result");
  result.classList.remove("hidden");
  result.innerHTML = `<div class="status">Checking ${REGIONS.length} Xbox stores for <strong>${escapeHtml(game.title)}</strong>…</div>`;

  const settled = await Promise.allSettled(REGIONS.map((r) => fetchRegionPrice(game.id, r)));
  const rows = settled
    .filter((s) => s.status === "fulfilled")
    .map((s) => s.value)
    .filter((r) => !r.missing && r.converted != null)
    .sort((a, b) => a.converted - b.converted);

  const failed = settled.filter((s) => s.status === "rejected").length;
  state.lastRows = rows;
  state.lastGame = { ...game, image: rows[0]?.image || game.image, title: rows[0]?.title || game.title };
  renderResult(failed);
}

function renderResult(failed = 0) {
  const game = state.lastGame;
  let rows = state.lastRows.slice();
  if (state.hideGiftCard) rows = rows.filter((r) => !r.region.giftCard);

  const result = $("result");
  if (!rows.length) {
    result.innerHTML = `<p class="err">No priced storefronts found for this title.</p>`;
    return;
  }

  const best = rows[0];
  const us = rows.find((r) => r.region.code === "US");
  const nz = rows.find((r) => r.region.code === "NZ");
  const vsUs = us ? Math.round((1 - best.converted / us.converted) * 100) : null;
  const fx = state.displayCurrency;

  const img = game.image
    ? (game.image.startsWith("http") ? game.image : "https:" + game.image)
    : "";

  result.innerHTML = `
    <div class="game-head">
      ${img ? `<img class="cover" src="${img}" alt="">` : ""}
      <div>
        <h2>${escapeHtml(game.title)}</h2>
        <div class="meta">${rows.length} stores · live Xbox prices</div>
        ${failed ? `<div class="meta">${failed} regions failed</div>` : ""}
      </div>
    </div>
    <div class="winner">
      <div class="label">Cheapest region</div>
      <div class="who">${best.region.flag} ${best.region.name}</div>
      <div class="amt">${money(best.converted, fx)}</div>
      <div class="local">${money(best.list, best.currency)}${best.region.giftCard ? " · gift card" : ""}</div>
      <div class="stats">
        <div class="stat"><b>${us ? money(us.converted, fx) : "—"}</b><span>United States</span></div>
        <div class="stat"><b>${nz ? money(nz.converted, fx) : "—"}</b><span>New Zealand</span></div>
        <div class="stat"><b>${vsUs == null ? "—" : vsUs + "%"}</b><span>Saved vs US</span></div>
        <div class="stat"><b>${rows.length}</b><span>Stores</span></div>
      </div>
    </div>
    <div class="toolbar">
      <h3>All regions</h3>
      <button class="filter ${state.hideGiftCard ? "on" : ""}" data-filter="toggle">
        ${state.hideGiftCard ? "Showing direct only" : "Hide gift-card stores"}
      </button>
    </div>
    <div class="cards">
      ${rows.map((row, i) => {
        const vs = us ? (row.converted - us.converted) / us.converted : null;
        const href = `https://www.xbox.com/${row.region.locale}/games/store/${slugify(game.title)}/${game.id}`;
        const save = vs == null ? "" : `${vs <= 0 ? "\u2212" : "+"}${Math.abs(vs * 100).toFixed(0)}% vs US`;
        return `<a class="row ${i === 0 ? "best" : ""}" href="${href}" target="_blank" rel="noopener">
          <div class="rank">${i + 1}</div>
          <div>
            <div class="rname">${row.region.flag} ${row.region.name}${row.region.giftCard ? '<span class="badge">gift card</span>' : ""}</div>
            <div class="rsub">${money(row.list, row.currency)}${row.discount ? " \u00b7 \u2212" + row.discount + "%" : ""}</div>
          </div>
          <div class="rprice">
            <strong>${money(row.converted, fx)}</strong>
            <div class="save ${vs != null && vs > 0.005 ? "worse" : ""}">${save}</div>
          </div>
        </a>`;
      }).join("")}
    </div>
  `;
  result.scrollIntoView({ behavior: "smooth", block: "start" });

  const toggle = result.querySelector("[data-filter=toggle]");
  if (toggle) {
    toggle.onclick = (e) => {
      e.preventDefault();
      state.hideGiftCard = !state.hideGiftCard;
      renderResult(failed);
    };
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """);
}

function renderFeatured() {
  $("featured").innerHTML = FEATURED.map(
    (g) => `<button class="chip" data-id="${g.id}" data-title="${escapeHtml(g.title)}">${g.title}</button>`
  ).join("");
  $("featured").onclick = (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    compareGame({ id: btn.dataset.id, title: btn.dataset.title, image: "" });
  };
}

function renderCurrencySelect() {
  const sel = $("displayCurrency");
  sel.innerHTML = DISPLAY_CURRENCIES.map(
    (c) => `<option value="${c}" ${c === state.displayCurrency ? "selected" : ""}>${c}</option>`
  ).join("");
  sel.onchange = () => {
    state.displayCurrency = sel.value;
    localStorage.setItem("xrh-fx", sel.value);
    if (state.lastGame) {
      state.lastRows = state.lastRows.map((r) => ({
        ...r,
        converted: toDisplay(r.list, r.currency),
      })).sort((a, b) => a.converted - b.converted);
      renderResult();
    }
  };
}

function bindSearch() {
  const input = $("q");
  const box = $("suggest");
  let timer = null;
  let latest = 0;

  const run = async () => {
    const q = input.value.trim();
    if (q.length < 2) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }
    const token = ++latest;
    try {
      const games = await searchGames(q);
      if (token !== latest) return;
      if (!games.length) {
        box.innerHTML = `<button disabled>No games found</button>`;
        box.classList.remove("hidden");
        return;
      }
      box.innerHTML = games
        .map(
          (g) => `<button data-id="${g.id}" data-title="${escapeHtml(g.title)}" data-image="${g.image}">
            ${g.image ? `<img src="${g.image}" alt="">` : ""}
            <span>${escapeHtml(g.title)}<br><small>${g.id}</small></span>
          </button>`
        )
        .join("");
      box.classList.remove("hidden");
    } catch (err) {
      box.innerHTML = `<button disabled class="err">Search error: ${escapeHtml(err.message)}</button>`;
      box.classList.remove("hidden");
    }
  };

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, 280);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = box.querySelector("button[data-id]");
      if (first) first.click();
      else run();
    }
  });
  $("searchBtn").onclick = () => {
    const first = box.querySelector("button[data-id]");
    if (first) first.click();
    else run();
  };
  box.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    box.classList.add("hidden");
    input.value = btn.dataset.title;
    compareGame({
      id: btn.dataset.id,
      title: btn.dataset.title,
      image: btn.dataset.image,
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-dock")) box.classList.add("hidden");
  });
}

function bindInstall() {
  const btn = $("installBtn");
  let deferred;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });
  btn.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    btn.hidden = true;
  });
  if (window.matchMedia("(display-mode: standalone)").matches) {
    const hint = $("installHint");
    if (hint) hint.hidden = true;
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

async function init() {
  renderFeatured();
  renderCurrencySelect();
  bindSearch();
  bindInstall();
  await loadRates();
}

init();
