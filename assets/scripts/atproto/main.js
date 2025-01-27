import { fetchConfig } from './config.js';
import { injectProfileData } from './injectProfile.js';
import { injectStatisticalData } from './statistics.js';

async function initialiseDataInjection() {
    try {
        console.debug('Initialising data injection...');
        const { did, pds } = await fetchConfig(); // Ensure pds is fetched from the config
        console.debug('DID and PDS fetched from config:', { did, pds });

        // Inject main profile data with both DID and PDS
        injectProfileData(did, pds);

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