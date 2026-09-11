const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/probabili', async (req, res) => {
  let browser;
  try {
    // Avvio ottimizzato per ambienti Cloud/Render
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // User-Agent aggiornato
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    // Timeout e navigazione
    await page.goto('https://www.fantacalcio.it/probabili-formazioni-serie-a', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    // Attesa caricamento elementi
    await page.waitForSelector('.card-player, .player-card, .player', { timeout: 10000 }).catch(() => {});

    // Estrazione dati generica e flessibile
    const probabili = await page.evaluate(() => {
      let risultati = [];
      const carte = document.querySelectorAll('[class*="player"]');

      carte.forEach(card => {
        const testo = card.innerText || "";
        const matchPerc = testo.match(/(\d{1,3})\s*%/);

        if (matchPerc) {
          const perc = parseInt(matchPerc[1]);
          // Estrae la prima riga di testo come nome del giocatore
          const righe = testo.split('\n').map(r => r.trim()).filter(r => r.length > 0 && !r.includes('%'));
          if (righe.length > 0 && perc >= 0 && perc <= 100) {
            risultati.push({
              nome: righe[0],
              percentuale: perc
            });
          }
        }
      });

      return risultati;
    });

    await browser.close();
    res.json({ success: true, count: probabili.length, data: probabili });

  } catch (error) {
    if (browser) await browser.close();
    console.error("Errore Scraping:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
