const express = require("express");
const axios = require("axios");
const app = express();

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
    // 🔹 pobieramy horoskop z API Ninja
    const resp = await axios.get("https://api.api-ninjas.com/v1/horoscope", {
      params: { zodiac: signEn },
      headers: { "X-Api-Key": process.env.API_KEY }
    });

    const englishHoroscope = resp.data.horoscope;
    if (!englishHoroscope) {
      return res.send("⚠️ API nie zwróciło horoskopu.");
    }

    let polish = null;
    try {
      // 🔹 próbujemy tłumaczenia
      const translation = await axios.post(
        "https://translate.terraprint.co/translate", // inna publiczna instancja
        {
          q: englishHoroscope,
          source: "en",
          target: "pl",
          format: "text"
        },
        { headers: { "Content-Type": "application/json" } }
      );

      polish = translation.data.translatedText;
    } catch (e) {
      console.warn("❌ Tłumaczenie nie działa, wysyłam EN:", e.message);
    }

    // 🔹 jeśli tłumaczenie się udało -> PL, jeśli nie -> EN
    res.send(`🔮 Horoskop dla ${signPl}: ${polish || englishHoroscope}`);

  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
    res.send("⚠️ Wystąpił problem z pobraniem horoskopu.");
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Serwer działa...")
);
