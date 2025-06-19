const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5500;

app.use(express.static('public'));

app.get('/api/arrivi/:stopNumber', async (req, res) => {
    const { stopNumber } = req.params;
    // Usiamo il nuovo indirizzo API che hai trovato!
    const apiUrl = `http://gpa.madbob.org/query.php?stop=${stopNumber}`;

    console.log(`[API] Ricevuta richiesta per fermata: ${stopNumber}. Chiamo ${apiUrl}`);

    try {
        // 1. Chiamiamo l'API con axios. Non servono più User-Agent o altre complicazioni.
        const response = await axios.get(apiUrl);

        // 2. L'API ci restituisce già un JSON. Dobbiamo solo adattarlo al formato
        //    che il nostro frontend si aspetta.
        const apiData = response.data;
        
        const arrivals = apiData.map(item => {
            return {
                line: item.line,
                time: `alle ${item.hour}` // Creiamo la stringa "alle HH:MM"
            };
        });
        
        if (arrivals.length === 0) {
            return res.status(404).json({ error: 'Nessun autobus in arrivo per questa fermata.' });
        }
        
        console.log(`[API] Trovati ${arrivals.length} arrivi. Invio dati.`);
        res.json(arrivals);

    } catch (error) {
        console.error("[ERRORE API]:", error.message);
        // Questo errore potrebbe scattare se l'API non è raggiungibile o la fermata non esiste
        res.status(500).json({ error: 'Fermata non trovata o servizio non disponibile.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
    console.log('Utilizzando la fonte dati API: gpa.madbob.org');
});