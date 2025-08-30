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
  // 1. Pobranie horoskopu (ENG) z API-Ninjas
  const resp = await axios.get("https://api.api-ninjas.com/v1/horoscope", {
    params: { zodiac: signEn },
    headers: { "X-Api-Key": process.env.API_KEY }
  });

  const englishHoroscope = resp.data.horoscope.today; // <- poprawka

  // 2. Tłumaczenie na polski (LibreTranslate darmowe)
  const translation = await axios.post("https://libretranslate.de/translate", {
    q: englishHoroscope,
    source: "en",
    target: "pl",
    format: "text"
  });

  const polish = translation.data.translatedText;

  res.send(`🔮 Horoskop dla ${signPl}: ${polish}`);
} catch (err) {
  console.error(err.message, err.response?.data);
  res.send("⚠️ Wystąpił problem z pobraniem horoskopu.");
}

});

app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Serwer działa...")
);
