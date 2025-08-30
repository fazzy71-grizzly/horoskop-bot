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
    // 🔹 Pobranie horoskopu z API Ninjas
    const resp = await axios.get("https://api.api-ninjas.com/v1/horoscope", {
      params: { zodiac: signEn },
      headers: { "X-Api-Key": process.env.API_KEY }
    });

    console.log("API response:", resp.data);

    // 🔹 Wyciągnięcie treści horoskopu
    const englishHoroscope = resp.data.horoscope;
    if (!englishHoroscope) {
      return res.send("⚠️ API nie zwróciło horoskopu. Odpowiedź: " + JSON.stringify(resp.data));
    }

    // 🔹 Tłumaczenie na polski
const translation = await axios.post(
  "https://libretranslate.de/translate",
  {
    q: englishHoroscope,
    source: "en",
    target: "pl",
    format: "text"
  },
  {
    headers: { "Content-Type": "application/json" }  // ⬅️ to dodaj
  }
);

const polish = translation.data.translatedText;


    // 🔹 Wyślij wynik
    res.send(`🔮 Horoskop dla ${signPl}: ${englishHoroscope}`);
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
    return res.send(
      "⚠️ Wystąpił problem z pobraniem horoskopu. Szczegóły: " +
        JSON.stringify(err.response?.data || err.message)
    );
  }
});

// ✅ To było brakujące zamknięcie całego pliku
app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Serwer działa...")
);
