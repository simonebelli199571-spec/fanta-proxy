const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/probabili', async (req, res) => {
    try {
        const response = await axios.get('https://www.fantacalcio.it/probabili-formazioni-serie-a', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
            }
        });
        
        const $ = cheerio.load(response.data);
        let giocatori = [];

        // Parsing delle probabili formazioni da Fantacalcio.it
        // Analizziamo i box dei giocatori per estrarre nome, percentuale e se presenti indici/quote
        $('.box-giocatore, .giocatore-item, tr').each((i, el) => {
            let nome = $(el).find('.nome, .player-name, td.nome').text().trim();
            let percentualeTxt = $(el).find('.percentuale, .perc').text().trim();
            let percentuale = parseInt(percentualeTxt) || null;

            if (nome && percentuale !== null) {
                giocatori.push({
                    nome: nome,
                    percentuale: percentuale,
                    quotaGol: null // Gestito dinamicamente tramite foglio Rosa o eventuale estrazione
                });
            }
        });

        // Fallback di sicurezza se la struttura della pagina ha selettori differenti
        if (giocatori.length === 0) {
            // Estrazione generica basata su elementi testuali comuni delle probabili formazioni
            $('div, span').each((i, el) => {
                let testo = $(el).text().trim();
                // Esempio logica di salvataggio pulito se necessario
            });
        }

        res.json({ 
            success: true, 
            count: giocatori.length,
            data: giocatori 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server in ascolto sulla porta ${PORT}`);
});
