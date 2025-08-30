import express from "express";
import fetch from "node-fetch";
import translate from "@vitalets/google-translate-api";

const app = express();
const PORT = process.env.PORT || 3000;

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

    // pobierz horoskop
    const response = await fetch(`https://ohmanda.com/api/horoscope/${signEN}`);
    const data = await response.json();

    // sprawdź czy mamy tekst horoskopu
    if (!data.horoscope) {
      return res.send("❌ Brak danych horoskopu!");
    }

    // przetłumacz
    const result = await translate(data.horoscope, { to: "pl" });

    // UWAGA: w nowej wersji tekst jest w result[0]
    const translatedText = result.text || result[0] || "";

    res.send(`Horoskop na dziś (${signPL}): ${translatedText}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Błąd przy pobieraniu horoskopu!");
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
