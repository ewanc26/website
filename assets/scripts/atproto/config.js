export async function fetchConfig() {
    try {
        console.debug('Fetching config from /assets/scripts/atproto/config.json...');
        const response = await fetch('/assets/scripts/atproto/config.json');
        if (!response.ok) {
            throw new Error(`Failed to load config file: ${response.statusText} (${response.status})`);
        }
        const config = await response.json();
        console.debug('Config fetched successfully:', config);
        return config;
    } catch (error) {
        console.error('Error fetching config:', error);
        throw error;
    }
}
