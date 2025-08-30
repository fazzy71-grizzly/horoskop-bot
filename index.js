import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Normalizacja: małe litery, bez ogonków, tylko a–z
function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

// Mapa po ZNORMALIZOWANYCH kluczach → indeks, etykieta (z ogonkami), emoji, nazwa do API
const SIGNS = {
  baran:       { idx: 0, label: "Baran",       emoji: "♈", api: "baran" },
  byk:         { idx: 1, label: "Byk",         emoji: "♉", api: "byk" },
  bliznieta:   { idx: 2, label: "Bliźnięta",   emoji: "♊", api: "bliźnięta" },
  rak:         { idx: 3, label: "Rak",         emoji: "♋", api: "rak" },
  lew:         { idx: 4, label: "Lew",         emoji: "♌", api: "lew" },
  panna:       { idx: 5, label: "Panna",       emoji: "♍", api: "panna" },
  waga:        { idx: 6, label: "Waga",        emoji: "♎", api: "waga" },
  skorpion:    { idx: 7, label: "Skorpion",    emoji: "♏", api: "skorpion" },
  strzelec:    { idx: 8, label: "Strzelec",    emoji: "♐", api: "strzelec" },
  koziorozec:  { idx: 9, label: "Koziorożec",  emoji: "♑", api: "koziorożec" },
  wodnik:      { idx:10, label: "Wodnik",      emoji: "♒", api: "wodnik" },
  ryby:        { idx:11, label: "Ryby",        emoji: "♓", api: "ryby" },
};

// Aliasy EN (opcjonalnie)
const ALIASES = {
  aries: "baran", taurus: "byk", gemini: "bliznieta", cancer: "rak",
  leo: "lew", virgo: "panna", libra: "waga", scorpio: "skorpion",
  sagittarius: "strzelec", capricorn: "koziorozec", aquarius: "wodnik", pisces: "ryby"
};

function resolveSignKey(input) {
  const n = normalize(input);
  if (SIGNS[n]) return n;
  if (ALIASES[n] && SIGNS[ALIASES[n]]) return ALIASES[n];
  return null;
}

app.get("/", (_req, res) => {
  res.send("Użycie: /<znak> np. /lew /panna /koziorozec — na Twitchu: !horoskop lew");
});

app.get("/debug/:sign", (req, res) => {
  const raw = req.params.sign || "";
  const key = resolveSignKey(raw);
  res.json({ raw, normalized: normalize(raw), resolvedKey: key, mapped: key ? SIGNS[key] : null });
});

app.get("/:sign", async (req, res) => {
  const key = resolveSignKey(req.params.sign || "");
  if (!key) return res.send("❌ Nieznany znak zodiaku! (np. panna, rak, lew...)");

  const { idx, label, emoji, api } = SIGNS[key];

  try {
    // Pobierz dane (API zwraca całą tablicę 12 znaków)
    const url = `https://www.moj-codzienny-horoskop.com/webmaster/api_JSON.php?type=1&sign=${encodeURIComponent(api)}`;
    const r = await fetch(url);
    const data = await r.json();

    const list = Array.isArray(data?.signs) ? data.signs : null;
    if (!list) return res.send("❌ Błąd przy pobieraniu horoskopu!");

    // 1) próba po indeksie (najpewniejsze)
    let item = list[idx];

    // 2) fallback: po nazwie z normalizacją (gdyby kolejność/locale się różniły)
    if (!item || normalize(item?.title) !== normalize(label)) {
      item = list.find(s => normalize(s?.title) === normalize(label)) || item;
    }

    if (!item?.prediction) return res.send("❌ Brak horoskopu dla tego znaku.");

    // Oczyść tekst + utnij "Czytaj więcej ..."
    let text = String(item.prediction)
      .replace(/<[^>]*>/g, "")                 // usuń HTML
      .replace(/Czytaj więcej.*$/i, "")        // usuń "Czytaj więcej ..."
      .replace(/\s+/g, " ")                    // składnia
      .trim();

    // Złóż odpowiedź
    const out = `🔮 Horoskop na dziś ${emoji} ${item.title || label}: ${text} | Źródło: moj-codzienny-horoskop.com`;
    res.send(out);

  } catch (e) {
    console.error(e);
    res.send("❌ Błąd przy pobieraniu horoskopu!");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
