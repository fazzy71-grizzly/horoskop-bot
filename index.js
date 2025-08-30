import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Mapowanie znaków → poprawna nazwa dla API + emoji
const signMap = {
  baran: { name: "baran", emoji: "♈" },
  byk: { name: "byk", emoji: "♉" },
  bliznieta: { name: "bliźnięta", emoji: "♊" },
  rak: { name: "rak", emoji: "♋" },
  lew: { name: "lew", emoji: "♌" },
  panna: { name: "panna", emoji: "♍" },
  waga: { name: "waga", emoji: "♎" },
  skorpion: { name: "skorpion", emoji: "♏" },
  strzelec: { name: "strzelec", emoji: "♐" },
  koziorozec: { name: "koziorożec", emoji: "♑" },
  wodnik: { name: "wodnik", emoji: "♒" },
  ryby: { name: "ryby", emoji: "♓" }
};

const validSigns = Object.keys(signMap);

app.get("/:sign", async (req, res) => {
  try {
    const rawSign = req.params.sign.toLowerCase();

    // Sprawdzamy czy znak istnieje w naszej mapie
    if (!validSigns.includes(rawSign)) {
      return res.send("❌ Nieznany znak zodiaku! (np. panna, rak, lew...)");
    }

    const { name, emoji } = signMap[rawSign];

    // Pobieramy horoskop z API
    const apiUrl = `https://www.moj-codzienny-horoskop.com/webmaster/api_JSON.php?type=1&sign=${encodeURIComponent(name)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.signs || !Array.isArray(data.signs)) {
      return res.send("❌ Błąd przy pobieraniu horoskopu!");
    }

    const horoscope = data.signs.find(s => s.title.toLowerCase() === name);
    if (!horoscope) {
      return res.send("❌ Brak horoskopu dla tego znaku.");
    }

    // Czyścimy tekst – usuwamy HTML i „Czytaj więcej...”
    let prediction = horoscope.prediction.replace(/<[^>]+>/g, "").trim();
    prediction = prediction.replace(/Czytaj więcej.+$/i, "").trim();

    // Finalna odpowiedź
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
