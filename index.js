import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// nazwy wyświetlane (z polskimi znakami)
const DISPLAY = [
  "baran","byk","bliźnięta","rak","lew","panna",
  "waga","skorpion","strzelec","koziorożec","wodnik","ryby"
];

// mapowanie po **znormalizowanych** nazwach (ASCII, małe litery, bez spacji)
const MAP = {
  // polskie
  baran: 0, byk: 1, bliznieta: 2, rak: 3, lew: 4, panna: 5,
  waga: 6, skorpion: 7, strzelec: 8, koziorozec: 9, wodnik: 10, ryby: 11,
  // angielskie (na wszelki wypadek)
  aries: 0, taurus: 1, gemini: 2, cancer: 3, leo: 4, virgo: 5,
  libra: 6, scorpio: 7, sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11
};

// normalizacja: przytnij spacje, małe litery, usuń diakrytyki i znaki nie-alfabetyczne
function normalizeSign(s = "") {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")                   // rozbij znaki z akcentami
    .replace(/[\u0300-\u036f]/g, "")   // usuń diakrytyki
    .replace(/[^a-z]/g, "");           // zostaw tylko a–z
}

// root – podpowiedź użycia
app.get("/", (_req, res) => {
  res.send("Użycie: /<znak> np. /panna, /byk, /skorpion  — lub na Twitchu: !horoskop panna");
});

// healthcheck – pod pingera
app.get("/health", (_req, res) => res.send("OK"));

// debug – pokaż co serwer widzi (pomocne przy SE)
app.get("/debug/:sign", (req, res) => {
  const raw = req.params.sign ?? "";
  const norm = normalizeSign(raw);
  const idx = MAP[norm];
  res.json({ raw, normalized: norm, matchedIndex: idx, matchedSign: idx != null ? DISPLAY[idx] : null });
});

// główny endpoint
app.get("/:sign", async (req, res) => {
  const rawInput = req.params.sign ?? "";
  const norm = normalizeSign(rawInput);
  const idx = MAP[norm];

  if (idx == null) {
    return res.send("❌ Nieznany znak zodiaku! (np. panna, rak, lew...)");
  }

  try {
    // Źródło zwraca wszystkie znaki naraz – bierzemy właściwy indeks
    const url = `https://www.moj-codzienny-horoskop.com/webmaster/api_JSON.php?type=1&sign=${encodeURIComponent(DISPLAY[idx])}`;
    const r = await fetch(url);
    const data = await r.json();

    const prediction = data?.signs?.[idx]?.prediction;
    if (!prediction) {
      return res.send("❌ Brak horoskopu dla tego znaku.");
    }

    // usuń HTML + „Czytaj więcej …”
    let text = prediction.replace(/<[^>]*>/g, "");
    text = text.replace(/Czytaj więcej.*/i, "").replace(/\s+/g, " ").trim();

    // przytnij pod limit SE (bezpiecznie)
    const MAX = 380; // zostawiamy miejsce na prefix/sufix
    if (text.length > MAX) text = text.slice(0, MAX) + "...";

    const label = DISPLAY[idx];
    res.send(`Horoskop na dziś (${label}): ${text} | Źródło: moj-codzienny-horoskop.com`);
  } catch (e) {
    console.error(e);
    res.send("❌ Błąd serwera przy pobieraniu horoskopu!");
  }
});

app.listen(PORT, () => console.log(`✅ Server działa na porcie ${PORT}`));
