import express from "express";
import fetch from "node-fetch";
import translate from "@vitalets/google-translate-api"; // darmowa paczka

const app = express();
const PORT = process.env.PORT || 3000;

// Mapowanie polskich nazw znaków na angielskie
const zodiacMap = {
  "baran": "aries",
  "byk": "taurus",
  "bliźnięta": "gemini",
  "rak": "cancer",
  "lew": "leo",
  "panna": "virgo",
  "waga": "libra",
  "skorpion": "scorpio",
  "strzelec": "sagittarius",
  "koziorożec": "capricorn",
  "wodnik": "aquarius",
  "ryby": "pisces"
};

app.get("/:sign", async (req, res) => {
  try {
    const signPL = req.params.sign.toLowerCase();
    const signEN = zodiacMap[signPL];

    if (!signEN) {
      return res.send("❌ Nie znam takiego znaku zodiaku!");
    }

    // Pobranie horoskopu po angielsku
    const response = await fetch(`https://ohmanda.com/api/horoscope/${signEN}`);
    const data = await response.json();

    // Tłumaczenie na polski
    const translated = await translate(data.horoscope, { to: "pl" });

    res.send(`Horoskop na dziś (${signPL}): ${translated.text}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Błąd przy pobieraniu horoskopu!");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
