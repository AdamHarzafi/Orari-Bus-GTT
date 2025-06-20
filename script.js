// script.js

window.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const stopForm = document.getElementById('stop-form');
    const stopInput = document.getElementById('stop-number-input');
    const resultsContainer = document.getElementById('results-container');
    const footer = document.getElementById('app-footer');

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

    stopForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const stopNumber = stopInput.value.trim();
        if (stopNumber) {
            await getBusArrivals(stopNumber);
        }
    });

    async function getBusArrivals(stopNumber) {
        resultsContainer.innerHTML = `
            <div class="loading-container">
                <div class="loader"></div>
            </div>
        `;

        try {
            // Chiamata al NOSTRO server. Il percorso relativo '/api/...' funzionerà perfettamente su Render.
            const response = await fetch(`/api/arrivi/${stopNumber}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Errore dal server: ${response.status}`);
            }

            const data = await response.json();
            
            const formattedData = data.map(item => ({
                line: item.line,
                time: `alle ${item.hour}`
            }));

            displayGroupedResults(formattedData);

        } catch (error) {
            console.error('Errore durante il recupero dei dati:', error);
            displayError(error.message);
        }
    }

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

    function displayError(message) {
        resultsContainer.innerHTML = `<div class="status-message error">${message}</div>`;
    }
});
