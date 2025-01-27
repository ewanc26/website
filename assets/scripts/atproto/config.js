export async function fetchConfig() {
    try {
        console.debug('Fetching config from /assets/scripts/atproto/config.json...');
        const response = await fetch('/assets/scripts/atproto/config.json');

        // If the response is not OK, throw an error
        if (!response.ok) {
            throw new Error(`Failed to load config file: ${response.statusText} (${response.status})`);
        }

        // Parse and return the config
        const config = await response.json();
        console.debug('Config fetched successfully:', config);
        return config;  // Return the fetched config object with `did` and `pds`
    } catch (error) {
        // Log the error and return fallback values for `did` and `pds`
        console.error('Error fetching config:', error);
        return { did: '', pds: '' };  // Return empty strings as fallback in case of an error
    }
}