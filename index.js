import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Mapa emoji dla znaków zodiaku
const emojiMap = {
  baran: "♈",
  byk: "♉",
  bliznieta: "♊",
  rak: "♋",
  lew: "♌",
  panna: "♍",
  waga: "♎",
  skorpion: "♏",
  strzelec: "♐",
  koziorozec: "♑",
  wodnik: "♒",
  ryby: "♓"
};

// Lista dostępnych znaków (po polsku, jak w API)
const validSigns = Object.keys(emojiMap);

app.get("/:sign", async (req, res) => {
  try {
    const sign = req.params.sign.toLowerCase();

    if (!validSigns.includes(sign)) {
      return res.send("❌ Nieznany znak zodiaku! (np. panna, rak, lew...)");
    }

    // Pobranie danych z API
    const apiUrl = "https://www.moj-codzienny-horoskop.com/webmaster/api_JSON.php?type=1&sign=" + sign;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.signs || !Array.isArray(data.signs)) {
      return res.send("❌ Błąd przy pobieraniu horoskopu!");
    }

    const horoscope = data.signs.find(s => s.title.toLowerCase() === sign);
    if (!horoscope) {
      return res.send("❌ Brak horoskopu dla tego znaku.");
    }

    const emoji = emojiMap[sign] || "✨";
    let prediction = horoscope.prediction.replace(/<[^>]+>/g, "").trim();

    // Usuwamy końcówkę "Czytaj więcej o ..."
    prediction = prediction.replace(/Czytaj więcej.+$/i, "").trim();

    // Odpowiedź dla StreamElements
    res.send(
      `🔮 Horoskop na dziś ${emoji} ${horoscope.title}: ${prediction} | Źródło: moj-codzienny-horoskop.com`
    );

  } catch (err) {
    console.error("Błąd serwera:", err);
    res.send("❌ Wewnętrzny błąd serwera przy pobieraniu horoskopu.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
