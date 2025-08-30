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
    // ✅ pobranie horoskopu
    const resp = await axios.get("https://api.api-ninjas.com/v1/horoscope", {
      params: { zodiac: signEn },
      headers: { "X-Api-Key": process.env.API_KEY }
    });

    console.log("API response:", resp.data);

    const englishHoroscope = resp.data.horoscope;

    if (!englishHoroscope) {
      return res.send("⚠️ API nie zwróciło horoskopu.");
    }

    // ✅ tłumaczenie przez darmowy serwer LibreTranslate
    const translation = await axios.post(
      "https://libretranslate.com/translate",
      {
        q: englishHoroscope,
        source: "en",
        target: "pl",
        format: "text"
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const polish = translation.data.translatedText;

    res.send(`🔮 Horoskop dla ${signPl}: ${polish}`);
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
    return res.send(
      "⚠️ Wystąpił problem z pobraniem horoskopu. Szczegóły: " +
        JSON.stringify(err.response?.data || err.message)
    );
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Serwer działa...")
);
