import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Mapowanie znaków na API + emoji
const signMap = {
  baran: { api: "baran", emoji: "♈" },
  byk: { api: "byk", emoji: "♉" },
  bliznieta: { api: "bliznieta", emoji: "♊" },
  rak: { api: "rak", emoji: "♋" },
  lew: { api: "lew", emoji: "♌" },
  panna: { api: "panna", emoji: "♍" },
  waga: { api: "waga", emoji: "♎" },
  skorpion: { api: "skorpion", emoji: "♏" },
  strzelec: { api: "strzelec", emoji: "♐" },
  koziorozec: { api: "koziorozec", emoji: "♑" },
  wodnik: { api: "wodnik", emoji: "♒" },
  ryby: { api: "ryby", emoji: "♓" }
};

// Endpoint
app.get("/:sign?", async (req, res) => {
  const rawSign = req.params.sign ? req.params.sign.toLowerCase() : "panna";

  if (!signMap[rawSign]) {
    return res.send("❌ Nieznany znak zodiaku! (np. panna, rak, lew...)");
  }

  try {
    // Pobranie danych z API
    const response = await fetch(
      `https://www.moj-codzienny-horoskop.com/webmaster/api_JSON.php?type=1&sign=${signMap[rawSign].api}`
    );
    const data = await response.json();

    // Szukanie horoskopu
    const horoscope = data.signs.find(
      (s) =>
        s.title.toLowerCase() === rawSign ||
        s.title.toLowerCase() === signMap[rawSign].api.toLowerCase()
    );

    if (!horoscope) {
      return res.send("❌ Brak horoskopu dla tego znaku.");
    }

    // Oczyszczenie tekstu z HTML
    const prediction = horoscope.prediction
      .replace(/<[^>]+>/g, "") // usuwa znaczniki HTML
      .trim();

    // Wynik końcowy
    const emoji = signMap[rawSign].emoji;
    const result = `🔮 Horoskop na dziś ${emoji} ${horoscope.title}: ${prediction} | Źródło: moj-codzienny-horoskop.com`;

    res.send(result);
  } catch (error) {
    console.error(error);
    res.send("❌ Błąd przy pobieraniu horoskopu!");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
