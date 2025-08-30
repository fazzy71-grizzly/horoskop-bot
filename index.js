import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const zodiacMap = {
  "baran": "baran",
  "byk": "byk",
  "bliźnięta": "bliznieta",
  "rak": "rak",
  "lew": "lew",
  "panna": "panna",
  "waga": "waga",
  "skorpion": "skorpion",
  "strzelec": "strzelec",
  "koziorożec": "koziorozec",
  "wodnik": "wodnik",
  "ryby": "ryby"
};

app.get("/:sign", async (req, res) => {
  const signPL = req.params.sign.toLowerCase();
  const signKey = zodiacMap[signPL];

  if (!signKey) {
    return res.send("❌ Nieznany znak zodiaku!");
  }

  try {
    const url = `https://www.moj-codzienny-horoskop.com/webmaster/api_JSON.php?type=1&sign=${signKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data?.horoscope) {
      return res.send("❌ Brak horoskopu dla tego znaku.");
    }

    res.send(`Horoskop na dziś (${signPL}): ${data.horoscope}`);
  } catch (err) {
    console.error(err);
    res.send("❌ Błąd serwera przy pobieraniu horoskopu!");
  }
});

app.listen(PORT, () => console.log(`Server działa: port ${PORT}`));
