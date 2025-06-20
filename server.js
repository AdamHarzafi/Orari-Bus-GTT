const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
// Render fornirà la porta corretta, non dobbiamo preoccuparcene
const PORT = process.env.PORT || 5500;

// 1. Abilita CORS per la massima compatibilità
app.use(cors());

// 2. Dice al server di servire i file del tuo sito (index.html, style.css, etc.)
app.use(express.static(path.join(__dirname, '')));

// 3. L'API personale che il tuo sito chiamerà
app.get('/api/arrivi/:stopNumber', async (req, res) => {
    const { stopNumber } = req.params;
    const apiUrl = `http://gpa.madbob.org/query.php?stop=${stopNumber}`;

    console.log(`Richiesta ricevuta per la fermata: ${stopNumber}`);

    try {
        const response = await axios.get(apiUrl);
        // Inoltriamo i dati così come arrivano
        res.json(response.data);
    } catch (error) {
        console.error("Errore nel contattare l'API GTT:", error.message);
        res.status(500).json({ error: 'Fermata non trovata o servizio esterno non disponibile.' });
    }
});

// 4. Assicura che chiunque visiti l'indirizzo principale riceva la tua pagina index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 5. Avvio del server
app.listen(PORT, () => {
    console.log(`Server avviato e in ascolto sulla porta ${PORT}`);
});
