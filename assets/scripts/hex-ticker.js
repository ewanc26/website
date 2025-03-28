async function initHexTicker() {
    try {
        // Fetch phrases
        const response = await fetch('/assets/data/phrases.json');
        const data = await response.json();
        const phrases = data.phrases;

        // Create ticker container
        const tickerContainer = document.createElement('div');
        tickerContainer.id = 'hex-ticker';

        // Create ticker content
        const tickerContent = document.createElement('div');
        tickerContent.id = 'hex-ticker-content';

        // Convert phrases to hex
        function stringToHex(str) {
            return str.split('').map(char => 
                char.charCodeAt(0).toString(16).padStart(2, '0')
            ).join(' ');
        }

        // Generate hex phrases
        const hexPhrases = phrases.map(phrase => 
            `[ ${stringToHex(phrase)} ]  `
        );

        // Repeat phrases to create continuous scroll
        const repeatCount = 5;
        tickerContent.textContent = hexPhrases.concat(hexPhrases)
            .repeat(repeatCount)
            .join(' • ');

        // Append content to container
        tickerContainer.appendChild(tickerContent);

        // Insert the ticker after the navigation
        const nav = document.querySelector('nav');
        if (nav) {
            nav.parentNode.insertBefore(tickerContainer, nav.nextSibling);
        }
    } catch (error) {
        console.error('Failed to initialize hex ticker:', error);
    }
}

// Run after other scripts have loaded
document.addEventListener('DOMContentLoaded', initHexTicker);