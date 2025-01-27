// Function to load configuration (DID) from an external JSON file
async function fetchConfig() {
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

// Function to fetch the main profile data (e.g., display name, description, avatar)
async function fetchProfileData(did) {
    const profileUrl = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`;
    try {
        console.debug(`Fetching profile data for DID: ${did} from ${profileUrl}...`);
        const response = await fetch(profileUrl);
        if (!response.ok) {
            console.error(`Failed to fetch profile data: ${response.statusText} (${response.status})`);
            return null;
        }
        const profileData = await response.json();
        console.debug('Profile data fetched successfully:', profileData);
        return profileData;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
}

// Function to inject the main profile data into the page
async function injectProfileData(did) {
    try {
        console.debug('Injecting main profile data...');
        const profileData = await fetchProfileData(did);
        if (!profileData) {
            console.error('Profile data is empty or could not be fetched');
            return;
        }

        // Extract necessary fields
        const { displayName, description, avatar } = profileData;

        // Inject into the page
        const displayNameElement = document.getElementById('profile-display-name');
        if (displayNameElement) {
            displayNameElement.textContent = displayName || 'ewan';
            console.debug('Updated display name:', displayName);
        }

        const descriptionElement = document.getElementById('profile-description');
        if (descriptionElement) {
            descriptionElement.textContent = description || 'a British poet and programmer.';
            console.debug('Updated description:', description);
        }

        const avatarElement = document.getElementById('profile-avatar');
        if (avatarElement) {
            avatarElement.src = avatar || '/assets/images/default-avatar.jpg'; // Fallback if no avatar
            console.debug('Updated avatar:', avatar);
        }
    } catch (error) {
        console.error('Error injecting main profile data:', error);
    }
}

// Function to fetch and inject the statistical data
async function injectStatisticalData(did) {
    try {
        console.debug('Injecting statistical data...');
        const profileData = await fetchProfileData(did);
        if (!profileData) {
            console.error('Statistical data is empty or could not be fetched');
            return;
        }

        // Extract statistical fields
        const { followersCount, followsCount, postsCount } = profileData;

        console.debug('Extracted profile stats:', {
            followersCount,
            followsCount,
            postsCount
        });

        // Inject into the page
        const followerCountElement = document.getElementById('follower-count-number');
        if (followerCountElement) {
            followerCountElement.textContent = followersCount || '0'; // Fallback to 0
            console.debug('Updated follower count element:', followerCountElement.textContent);
        } else {
            console.info('Note: Follower count element is missing on the page.');
        }

        const followingCountElement = document.getElementById('following-count-number');
        if (followingCountElement) {
            followingCountElement.textContent = followsCount || '0'; // Fallback to 0
            console.debug('Updated following count element:', followingCountElement.textContent);
        } else {
            console.info('Note: Following count element is missing on the page.');
        }

        const postCountElement = document.getElementById('post-count-number');
        if (postCountElement) {
            postCountElement.textContent = postsCount || '0'; // Fallback to 0
            console.debug('Updated post count element:', postCountElement.textContent);
        } else {
            console.info('Note: Post count element is missing on the page.');
        }
    } catch (error) {
        console.error('Error injecting statistical data:', error);
    }
}

// Main function to initialise the data injection
async function initialiseDataInjection() {
    try {
        console.debug('Initialising data injection...');
        
        // Fetch configuration to get DID
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