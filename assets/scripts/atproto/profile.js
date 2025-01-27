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

// Function to fetch profile data with sessionStorage caching
async function fetchProfileData(did) {
    const cacheKey = `profileData_${did}`;
    const expiryKey = `${cacheKey}_expiry`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const expiryTime = sessionStorage.getItem(expiryKey);

    if (cachedData && expiryTime && Date.now() < expiryTime) {
        console.debug('Using cached profile data');
        return JSON.parse(cachedData); // Return cached data if it has not expired
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
        sessionStorage.setItem(cacheKey, JSON.stringify(profileData));
        sessionStorage.setItem(expiryKey, Date.now() + expiryInMs); // Set expiry time

        return profileData;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
}

// Function to inject profile data into the page with ARIA accessibility
async function injectProfileData(did) {
    try {
        console.debug('Injecting main profile data...');
        const profileData = await fetchProfileData(did);
        if (!profileData) {
            console.error('Profile data is empty or could not be fetched');
            return;
        }

        const { displayName, description, avatar, handle } = profileData;

        // Inject display name with ARIA
        const displayNameElement = document.getElementById('profile-display-name');
        if (displayNameElement) {
            displayNameElement.textContent = displayName || 'ewan';
            displayNameElement.setAttribute('aria-live', 'polite');  // Live region for screen readers
            console.debug('Updated display name:', displayName);
        }

        // Inject description with ARIA
        const descriptionElement = document.getElementById('profile-description');
        if (descriptionElement) {
            descriptionElement.textContent = description || 'a British poet and programmer.';
            descriptionElement.setAttribute('aria-live', 'polite');  // Live region for screen readers
            console.debug('Updated description:', description);
        }

        // Inject avatar with alt text for accessibility, no fallback for avatar
        const avatarElement = document.getElementById('profile-avatar');
        if (avatarElement) {
            avatarElement.src = avatar || ''; // No fallback image
            avatarElement.alt = displayName || 'User Avatar';  // Provide descriptive alt text
            console.debug('Updated avatar:', avatar);
        }

        // Inject handle with ARIA
        const handleElements = document.querySelectorAll('#profile-handle');
        handleElements.forEach((element) => {
            element.textContent = handle || 'account';
            element.setAttribute('aria-live', 'polite');
            console.debug('Updated handle:', handle);
        });

        // Update website title and heading dynamically
        if (displayName) {
            // Update the <title>
            const pageTitle = document.title.split('|')[0].trim();
            document.title = `${pageTitle} | ${displayName}'s Corner`;
            console.debug('Updated <title>:', document.title);

            // Update the website title element
            const websiteTitleElement = document.getElementById('website_title');
            if (websiteTitleElement) {
                websiteTitleElement.innerHTML = `<b>${displayName}'s Corner</b>`;
                console.debug('Updated #website_title:', websiteTitleElement.innerHTML);
            }
        }
    } catch (error) {
        console.error('Error injecting main profile data:', error);
    }
}

// Function to fetch and inject statistical data with sessionStorage caching
async function injectStatisticalData(did) {
    const cacheKey = `statisticalData_${did}`;
    const expiryKey = `${cacheKey}_expiry`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const expiryTime = sessionStorage.getItem(expiryKey);

    if (cachedData && expiryTime && Date.now() < expiryTime) {
        console.debug('Using cached statistical data');
        const { followersCount, followsCount, postsCount } = JSON.parse(cachedData);
        updateStatisticalElements(followersCount, followsCount, postsCount);
        return;
    }

    try {
        console.debug('Injecting statistical data...');
        const profileData = await fetchProfileData(did);
        if (!profileData) {
            console.error('Statistical data is empty or could not be fetched');
            return;
        }

        const { followersCount, followsCount, postsCount } = profileData;

        // Cache statistical data and set an expiry (e.g., 5 minutes)
        const expiryInMs = 300000; // 5 minutes expiry
        sessionStorage.setItem(cacheKey, JSON.stringify({ followersCount, followsCount, postsCount }));
        sessionStorage.setItem(expiryKey, Date.now() + expiryInMs); // Set expiry time

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

// Main function to initialise the data injection with sessionStorage caching and accessibility
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