import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Mapowanie polskich nazw znaków na indeksy w JSON (0 = Baran, 1 = Byk itd.)
const zodiacMap = {
  "baran": 0,
  "byk": 1,
  "bliźnięta": 2,
  "bliznieta": 2, // na wszelki wypadek bez polskich znaków
  "rak": 3,
  "lew": 4,
  "panna": 5,
  "waga": 6,
  "skorpion": 7,
  "strzelec": 8,
  "koziorożec": 9,
  "koziorozec": 9,
  "wodnik": 10,
  "ryby": 11
};

app.get("/:sign", async (req, res) => {
  const signPL = req.params.sign.toLowerCase();
  const signIndex = zodiacMap[signPL];

  if (signIndex === undefined) {
    return res.send("❌ Nieznany znak zodiaku!");
  }

  try {
    const url = `https://www.moj-codzienny-horoskop.com/webmaster/api_JSON.php?type=1&sign=${signPL}`;
    const response = await fetch(url);
    const data = await response.json();

    const horo = data?.signs?.[signIndex]?.prediction;

    if (!horo) {
      return res.send("❌ Brak horoskopu dla tego znaku.");
    }

    // Usuwamy HTML z "Czytaj więcej o..."
    const clean = horo.replace(/<[^>]*>?/gm, "");

    res.send(`Horoskop na dziś (${signPL}): ${clean}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Błąd serwera przy pobieraniu horoskopu!");
  }
});

app.listen(PORT, () => console.log(`✅ Server działa na porcie ${PORT}`));
