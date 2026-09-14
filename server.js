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

        // Scansiona tutti i box dei giocatori presenti nelle probabili formazioni
        $('.player-item, .field-player, tr, .box-giocatore').each((i, el) => {
            let nome = $(el5 = $(el)).find('.name, .nome-giocatore, strong').first().text().trim();
            let percTxt = $(el).find('.percentage, .percentuale').text().trim();
            
            // Estrae i numeri dalla percentuale (es. "80%")
            let percentuale = parseInt(percTxt.replace(/[^0-9]/g, '')) || null;

            if (nome && nome.length > 2 && percentuale !== null) {
                giocatori.push({
                    nome: nome,
                    percentuale: percentuale,
                    quotaGol: null
                });
            }
        });

        // Seleziona univocamente rimuovendo i duplicati
        let unici = Array.from(new Map(giocatori.map(item => [item.nome.toLowerCase(), item])).values());

        res.json({ 
            success: true, 
            count: unici.length,
            data: unici 
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
