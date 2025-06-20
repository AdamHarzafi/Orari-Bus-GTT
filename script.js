// script.js

// Attende che tutta la pagina sia caricata
window.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const stopForm = document.getElementById('stop-form');
    const stopInput = document.getElementById('stop-number-input');
    const resultsContainer = document.getElementById('results-container');
    const footer = document.getElementById('app-footer');

    // --- LOGICA DELLA SCHERMATA DI BENVENUTO ---
    if (splashScreen && mainContent) {
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            splashScreen.style.visibility = 'hidden';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            footer.style.visibility = 'visible';
            footer.style.opacity = '1';
        }, 2500);
    }

    // --- GESTIONE DELL'INVIO DEL FORM ---
    stopForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const stopNumber = stopInput.value.trim();
        if (stopNumber) {
            await getBusArrivals(stopNumber);
        }
    });

    /**
     * Recupera i dati degli arrivi usando un proxy pubblico per evitare problemi di CORS.
     * Questa versione funziona su host statici come GitHub Pages.
     */
    async function getBusArrivals(stopNumber) {
        resultsContainer.innerHTML = `
            <div class="loading-container">
                <div class="loader"></div>
            </div>
        `;

        // L'URL dell'API esterna che vogliamo chiamare
        const apiUrl = `http://gpa.madbob.org/query.php?stop=${stopNumber}`;
        
        // Usiamo un proxy pubblico per aggirare le restrizioni di sicurezza (CORS)
        // Il proxy fa la chiamata per noi e ci restituisce il risultato
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                // Se il proxy o l'API danno errore
                throw new Error(`Errore di rete: ${response.status}`);
            }

            const data = await response.json();
            
            // Dobbiamo adattare i dati al formato che la nostra funzione si aspetta
            const formattedData = data.map(item => ({
                line: item.line,
                time: `alle ${item.hour}`
            }));

            displayGroupedResults(formattedData);

        } catch (error) {
            console.error('Errore durante il recupero dei dati:', error);
            // Messaggio di errore più generico ma efficace
            displayError(`Fermata non trovata o servizio non disponibile. Riprova.`);
        }
    }

    /**
     * Raggruppa e mostra i risultati nell'HTML. (Questa funzione rimane invariata)
     */
    function displayGroupedResults(arrivals) {
        resultsContainer.innerHTML = ''; 

        if (arrivals.length === 0) {
            resultsContainer.innerHTML = '<div class="status-message">Nessun autobus in arrivo per questa fermata.</div>';
            return;
        }

        const groupedByLine = arrivals.reduce((acc, arrival) => {
            if (!acc[arrival.line]) {
                acc[arrival.line] = [];
            }
            const time = arrival.time.replace('alle ', '');
            acc[arrival.line].push(time);
            return acc;
        }, {});

        for (const line in groupedByLine) {
            const times = groupedByLine[line].join(', ');
            const arrivalDiv = document.createElement('div');
            arrivalDiv.className = 'bus-arrival';
            
            arrivalDiv.innerHTML = `
                <div class="bus-arrival-content">
                    <div class="bus-arrival-header">
                        <i class="fa-solid fa-bus bus-icon"></i>
                        <span>LINEA ${line}</span>
                    </div>
                    <div class="bus-arrival-times">
                        In arrivo alle: ${times}
                    </div>
                </div>
                <img src="Disabilità.png" alt="Logo accessibilità" class="disability-logo">
            `;
            resultsContainer.appendChild(arrivalDiv);
        }
    }

    /**
     * Mostra un messaggio di errore nell'HTML. (Questa funzione rimane invariata)
     */
    function displayError(message) {
        resultsContainer.innerHTML = `<div class="status-message error">${message}</div>`;
    }
});
