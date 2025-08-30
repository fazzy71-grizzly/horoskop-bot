Przejdź do treści
Historia czatu

Powiedziałeś(-aś):
Chcę zrobić komendę na twitch dla widzów aby po wpisaniu !horoskop "nazwa zodiaku" wyskakiwał im za pomocą streamelementsa horoskop na dany dzień dla wybranego przez siebie zodiaku. Mam już klucz z api ninja, zrobiłem pliki na githubie, oraz wrzuciłem je przez render. Po włączeniu strony z np. baranem, na stronie się pojawia: Horoskop dla baran: undefined, a w logach rendera jest taka informacja: 

horoscope: "Today, Aries, you may find yourself needing to tackle some paperwork. Expect to spend a fair amount of time on the phone as well. It's important to keep your communication straightforward and sincere to ensure you achieve your goals. Additionally, a heartfelt conversation with a close friend or partner could lead to a visit at your place, deepening your connection."

Jak to naprawić aby działało
ChatGPT powiedział:
Rozumiem 👍 Problem wygląda tak, że w logach Rendera horoskop przychodzi poprawnie z API, ale w przeglądarce (czyli w Twojej stronie) widzisz undefined. To oznacza, że w kodzie, który odpowiada za wyświetlenie danych, odwołujesz się nie do tej właściwości obiektu, którą zwraca API.

API Ninjas dla horoskopów zwraca coś w tym stylu (JSON):

{
  "sign": "aries",
  "horoscope": "Today, Aries, you may find yourself needing..."
}
A Ty pewnie w kodzie próbujesz zrobić coś takiego:

const data = await response.json();
console.log("horoscope:", data.horoscope); 
document.getElementById("output").innerText =
  `Horoskop dla ${sign}: ${data.result}`; // <-- błąd
data.result nie istnieje, dlatego wychodzi undefined.

✅ Poprawne rozwiązanie
Musisz korzystać z właściwości data.horoscope, a nie data.result.
Przykład:

const sign = "aries"; // np. pobrany z query param
fetch(`https://api.api-ninjas.com/v1/horoscope?sign=${sign}`, {
  headers: { "X-Api-Key": "TWÓJ_KLUCZ" }
})
  .then(res => res.json())
  .then(data => {
    console.log("horoscope:", data.horoscope);
    document.getElementById("output").innerText =
      `Horoskop dla ${sign}: ${data.horoscope}`;
  })
  .catch(err => console.error(err));
⚡ Co teraz możesz zrobić:

Sprawdź w kodzie, gdzie wstawiasz do HTML-a tekst.
Jeżeli masz np. ${data.result}, zmień to na ${data.horoscope}.

Wyrenderuj ponownie aplikację na Render.

Przetestuj z ?sign=baran albo ?sign=aries (API Ninjas używa nazw po angielsku!).

👉 Pytanie do Ciebie: chcesz, żebym Ci rozpisał kompletny przykład komendy pod Twitch Streamelements (żeby widz po wpisaniu !horoskop baran dostał odpowiedź na czacie), czy tylko poprawić kod strony (Render)?

Powiedziałeś(-aś):
Nie mam żadnego result:
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
    params: { zodiac: signEn },
    headers: { "5xI2pNA3GK3MSFV3AOACOA==1MsMOXEaPRUkYarB": process.env.API_KEY }
  });

  console.log("API response:", resp.data); // <<< logowanie w konsoli

  const englishHoroscope = resp.data.horoscope; // <<< to powinien być string

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

  res.send(🔮 Horoskop dla ${signPl}: ${polish});
} catch (err) {
  console.error("API error:", err.response?.data || err.message);
  res.send("⚠️ Wystąpił problem z pobraniem horoskopu.");
}


});

app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Serwer działa...")
);
ChatGPT powiedział:
Super, że wkleiłeś cały kod 🚀
Widzę dokładnie, gdzie jest problem.

1. Błąd w nagłówkach
W tym fragmencie:

headers: { "5xI2pNA3GK3MSFV3AOACOA==1MsMOXEaPRUkYarB": process.env.API_KEY }
to nie jest poprawny nagłówek.
API Ninjas wymaga:

headers: { "X-Api-Key": process.env.API_KEY }
2. Błąd w nazwie parametru
Zgodnie z dokumentacją API Ninjas Horoscope, endpoint to:

GET https://api.api-ninjas.com/v1/horoscope?sign=aries
a nie zodiac.
U Ciebie masz:

params: { zodiac: signEn }
a powinno być:

params: { sign: signEn }
3. Całość poprawionego kodu
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
