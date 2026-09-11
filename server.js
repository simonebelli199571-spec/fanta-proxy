const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/probabili', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto('https://www.fantacalcio.it/probabili-formazioni-serie-a', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const probabili = await page.evaluate(() => {
      let risultati = [];
      const carteGiocatori = document.querySelectorAll('.player-card, .card-player');

      carteGiocatori.forEach(card => {
        const nomeEl = card.querySelector('.player-name, .name');
        const percEl = card.querySelector('.player-percentage, .percentage');

        if (nomeEl && percEl) {
          let nome = nomeEl.innerText.trim();
          let percText = percEl.innerText.replace('%', '').trim();
          let perc = parseInt(percText);

          if (nome && !isNaN(perc)) {
            risultati.push({ nome: nome, percentuale: perc });
          }
        }
      });

      return risultati;
    });

    await browser.close();
    res.json({ success: true, count: probabili.length, data: probabili });

  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ success: false, error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
