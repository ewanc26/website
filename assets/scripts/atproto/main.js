import { fetchConfig } from './config.js';
import { injectProfileData } from './injectProfile.js';
import { injectStatisticalData } from './statistics.js';

async function initialiseDataInjection() {
    try {
        console.debug('Initialising data injection...');
        const { did } = await fetchConfig();
        console.debug('DID fetched from config:', did);

        // Inject main profile data
        injectProfileData(did);

        // Inject statistical data separately
        injectStatisticalData(did);

        // Set up interval to refresh statistical data every 5 minutes
        console.debug('Setting up interval to refresh statistical data every 5 minutes.');
        setInterval(() => injectStatisticalData(did), 300000); // Refresh stats every 5 minutes
    } catch (error) {
        console.error('Error during initialisation:', error);
    }
}

// Call the initialisation function when the page loads
window.onload = () => {
    console.debug('Page loaded. Starting data injection...');
    initialiseDataInjection();
};
