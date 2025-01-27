// Function to load configuration (DID) from an external JSON file
async function fetchConfig() {
    try {
        const response = await fetch('/assets/scripts/atproto/config.json');
        if (!response.ok) {
            throw new Error('Failed to load config file');
        }
        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Error fetching config:', error);
        throw error;
    }
}

// Function to fetch the profile data from the new endpoint
async function fetchProfileData(did) {
    const profileUrl = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`;
    try {
        const response = await fetch(profileUrl);
        if (!response.ok) {
            console.error('Failed to fetch profile data:', response.statusText);
            return null;
        }
        const profileData = await response.json();
        return profileData; // Return the full profile data
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
}

// Main function to fetch and inject data
async function injectProfileData() {
    try {
        // Load configuration dynamically (only need DID now)
        const { did } = await fetchConfig();

        // Fetch profile data
        const profileData = await fetchProfileData(did);
        if (!profileData) {
            console.error('Profile data is empty or could not be fetched');
            return;
        }

        // Extract necessary fields from the profile
        const { displayName, description, avatar } = profileData;

        // Inject the data into your page
        const displayNameElement = document.getElementById('profile-display-name');
        if (displayNameElement) {
            displayNameElement.textContent = displayName || 'ewan';
        }

        const descriptionElement = document.getElementById('profile-description');
        if (descriptionElement) {
            descriptionElement.textContent = description || 'a British poet and programmer.';
        }

        const avatarElement = document.getElementById('profile-avatar');
        if (avatarElement) {
            avatarElement.src = avatar || '/assets/images/default-avatar.jpg';  // Fallback if no avatar
        }

    } catch (error) {
        console.error('Error fetching or injecting profile data:', error);
    }
}

// Call the function to inject data when the page loads
window.onload = () => {
    injectProfileData();  // Initial injection on page load
    // Set an interval to refresh the profile data every 5 minutes (300,000 ms)
    setInterval(injectProfileData, 300000);
};
