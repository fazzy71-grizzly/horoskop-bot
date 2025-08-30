const express = require("express");
const axios = require("axios");
const translate = require("google-translate-api-x"); // ✅ import tłumacza
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
    // ✅ pobranie horoskopu z API Ninjas
    const resp = await axios.get("https://api.api-ninjas.com/v1/horoscope", {
      params: { zodiac: signEn },
      headers: { "X-Api-Key": process.env.API_KEY }
    });

    console.log("API response:", resp.data);

    let englishHoroscope = resp.data.horoscope;

    if (!englishHoroscope) {
      return res.send("⚠️ API nie zwróciło horoskopu.");
    }

    // ✅ tłumaczenie horoskopu na polski
    const translation = await translate(englishHoroscope, { to: "pl" });

    res.send(`🔮 Horoskop dla ${signPl}: ${translation.text}`);
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
    res.send(
      "⚠️ Wystąpił problem z pobraniem horoskopu. " +
        JSON.stringify(err.response?.data || err.message)
    );
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Serwer działa...")
);
