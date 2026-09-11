const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/probabili', async (req, res) => {
  try {
    // Richiesta HTTP diretta al sito
    const response = await axios.get('https://www.fantacalcio.it/probabili-formazioni-serie-a', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    let risultati = [];

    // Estrazione dei dati dai blocchi dei giocatori
    $('[class*="player"]').each((i, el) => {
      const testo = $(el).text().trim();
      const matchPerc = testo.match(/(\d{1,3})\s*%/);

      if (matchPerc) {
        const perc = parseInt(matchPerc[1]);
        const righe = testo.split('\n').map(r => r.trim()).filter(r => r.length > 0 && !r.includes('%'));

        if (righe.length > 0 && perc >= 0 && perc <= 100) {
          risultati.push({
            nome: righe[0],
            percentuale: perc
          });
        }
      }
    });

    res.json({ success: true, count: risultati.length, data: risultati });

  } catch (error) {
    console.error("Errore estrazione dati:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
