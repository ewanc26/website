<<<<<<< HEAD
export async function fetchProfileData(did, pds) {
=======
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

// Function to fetch profile data with caching and expiry
async function fetchProfileData(did) {
>>>>>>> parent of 779fe48 (replace local storage with session storage)
    const cacheKey = `profileData_${did}`;
    const expiryKey = `${cacheKey}_expiry`;
    const cachedData = localStorage.getItem(cacheKey);
    const expiryTime = localStorage.getItem(expiryKey);

    if (cachedData && expiryTime && Date.now() < expiryTime) {
        console.debug('Using cached profile data');
        return JSON.parse(cachedData); // Return cached data if it has not expired
    }

    const profileUrl = `https://${pds}/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=app.bsky.actor.profile&rkey=self`;
    try {
        console.debug(`Fetching profile data for DID: ${did} from ${profileUrl}...`);
        const response = await fetch(profileUrl);
        if (!response.ok) {
            console.error(`Failed to fetch profile data: ${response.statusText} (${response.status})`);
            return null;
        }
        const profileData = await response.json();
        console.debug('Profile data fetched successfully:', profileData);
        
        // Cache profile data for future use and set an expiry (e.g., 1 hour)
        const expiryInMs = 3600000; // 1 hour expiry
        localStorage.setItem(cacheKey, JSON.stringify(profileData));
        localStorage.setItem(expiryKey, Date.now() + expiryInMs); // Set expiry time
        
        return profileData;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
<<<<<<< HEAD
}
=======
}

// Function to fetch profile data with caching and expiry
async function fetchProfileData(did) {
    const cacheKey = `profileData_${did}`;
    const expiryKey = `${cacheKey}_expiry`;
    const cachedData = localStorage.getItem(cacheKey);
    const expiryTime = localStorage.getItem(expiryKey);

    if (cachedData && expiryTime && Date.now() < expiryTime) {
        console.debug('Using cached profile data');
        return JSON.parse(cachedData); // Return cached profile data if it has not expired
    }

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
        
        // Cache profile data for future use and set an expiry (e.g., 1 hour)
        const expiryInMs = 3600000; // 1 hour expiry
        localStorage.setItem(cacheKey, JSON.stringify(profileData));
        localStorage.setItem(expiryKey, Date.now() + expiryInMs); // Set expiry time
        
        return profileData;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
}

// Function to inject statistical data with caching and expiry (now using profileData)
async function injectStatisticalData(did) {
    const cacheKey = `statisticalData_${did}`;
    const expiryKey = `${cacheKey}_expiry`;
    const cachedData = localStorage.getItem(cacheKey);
    const expiryTime = localStorage.getItem(expiryKey);

    if (cachedData && expiryTime && Date.now() < expiryTime) {
        console.debug('Using cached statistical data');
        const { followersCount, followsCount, postsCount } = JSON.parse(cachedData);
        updateStatisticalElements(followersCount, followsCount, postsCount);
        return;
    }

    try {
        console.debug('Injecting statistical data...');
        const profileData = await fetchProfileData(did); // Get profile data
        if (!profileData) {
            console.error('Statistical data is empty or could not be fetched');
            return;
        }

        const { followersCount, followsCount, postsCount } = profileData;

        // Cache statistical data and set an expiry (e.g., 5 minutes)
        const expiryInMs = 300000; // 5 minutes expiry
        localStorage.setItem(cacheKey, JSON.stringify({ followersCount, followsCount, postsCount }));
        localStorage.setItem(expiryKey, Date.now() + expiryInMs); // Set expiry time
        
        updateStatisticalElements(followersCount, followsCount, postsCount);
    } catch (error) {
        console.error('Error injecting statistical data:', error);
    }
}

// Helper function to update statistical elements
function updateStatisticalElements(followersCount, followsCount, postsCount) {
    const followerCountElement = document.getElementById('follower-count-number');
    if (followerCountElement) {
        followerCountElement.textContent = followersCount || '0';
        followerCountElement.setAttribute('aria-live', 'polite');
        console.debug('Updated follower count element:', followerCountElement.textContent);
    }

    const followingCountElement = document.getElementById('following-count-number');
    if (followingCountElement) {
        followingCountElement.textContent = followsCount || '0';
        followingCountElement.setAttribute('aria-live', 'polite');
        console.debug('Updated following count element:', followingCountElement.textContent);
    }

    const postCountElement = document.getElementById('post-count-number');
    if (postCountElement) {
        postCountElement.textContent = postsCount || '0';
        postCountElement.setAttribute('aria-live', 'polite');
        console.debug('Updated post count element:', postCountElement.textContent);
    }
}

// Main function to initialise the data injection with caching and accessibility
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
>>>>>>> parent of 779fe48 (replace local storage with session storage)
