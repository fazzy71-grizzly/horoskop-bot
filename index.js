const express = require("express");
const axios = require("axios");
const app = express();

// 🔹 MAPA znaków PL -> EN
const zodiacMap = {
  baran: "aries",
  byk: "taurus",
  bliznieta: "gemini",
  rak: "cancer",
  lew: "leo",
  panna: "virgo",
  waga: "libra",
  skorpion: "scorpio",
  strzelec: "sagittarius",
  koziorozec: "capricorn",
  wodnik: "aquarius",
  ryby: "pisces"
};

app.get("/horoskop", async (req, res) => {
  const signPl = (req.query.sign || "").toLowerCase();
  const signEn = zodiacMap[signPl];

  if (!signEn) {
    return res.send("❌ Podaj poprawny znak zodiaku (np. baran, byk, ryby).");
  }

  try {
    const resp = await axios.get("https://api.api-ninjas.com/v1/horoscope", {
      params: { sign: signEn }, // ✅ poprawione
      headers: { "X-Api-Key": process.env.API_KEY } // ✅ poprawione
    });

    console.log("API response:", resp.data);

    const englishHoroscope = resp.data.horoscope; // ✅ tu powinien być tekst

    if (!englishHoroscope) {
      return res.send("⚠️ API nie zwróciło horoskopu.");
    }

    const translation = await axios.post("https://libretranslate.de/translate", {
      q: englishHoroscope,
      source: "en",
      target: "pl",
      format: "text"
    });

    const polish = translation.data.translatedText;

    res.send(`🔮 Horoskop dla ${signPl}: ${polish}`);
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
    res.send("⚠️ Wystąpił problem z pobraniem horoskopu.");
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Serwer działa...")
);
