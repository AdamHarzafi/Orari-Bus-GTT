const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;

// Abilita CORS per permettere le richieste dal frontend
app.use(cors());

// Serve i file statici (CSS, JS, immagini) dalla cartella principale
app.use(express.static(path.join(__dirname, '')));

// Endpoint dell'API per recuperare gli orari
app.get('/api/arrivi/:stopNumber', async (req, res) => {
    const { stopNumber } = req.params;
    const apiUrl = `http://gpa.madbob.org/query.php?stop=${stopNumber}`;

    console.log(`[API] Ricevuta richiesta per fermata: ${stopNumber}. Chiamo ${apiUrl}`);

    try {
        const response = await axios.get(apiUrl);
        const apiData = response.data;
        
        const arrivals = apiData.map(item => ({
            line: item.line,
            time: `alle ${item.hour}`
        }));
        
        console.log(`[API] Trovati ${arrivals.length} arrivi. Invio dati.`);
        res.json(arrivals);

    } catch (error) {
        console.error("[ERRORE API]:", error.message);
        res.status(500).json({ error: 'Fermata non trovata o servizio non disponibile.' });
    }
});

// Route principale per servire il file index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
    console.log('Utilizzando la fonte dati API: gpa.madbob.org');
});
