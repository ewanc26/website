export async function injectProfileData(did, pds) {
    try {
        console.debug('Injecting main profile data...');
        const profileData = await fetchProfileData(did, pds); // Pass `pds` along with `did`
        
        if (!profileData) {
            console.error('Profile data is empty or could not be fetched');
            return;
        }

        console.debug('Fetched profile data:', profileData);

        const { displayName, description, avatar, handle } = profileData.value;

        // Inject display name with ARIA
        const displayNameElement = document.getElementById('profile-display-name');
        if (displayNameElement) {
            displayNameElement.textContent = displayName || 'ewan';
            displayNameElement.setAttribute('aria-live', 'polite');
            console.debug('Updated display name:', displayName);
        }

        // Inject description with ARIA
        const descriptionElement = document.getElementById('profile-description');
        if (descriptionElement) {
            descriptionElement.textContent = description || 'a British poet and programmer.';
            descriptionElement.setAttribute('aria-live', 'polite');
            console.debug('Updated description:', description);
        }

        // Inject avatar with alt text for accessibility
        const avatarElement = document.getElementById('profile-avatar');
        if (avatarElement) {
            avatarElement.src = avatar || '';
            avatarElement.alt = displayName || 'User Avatar';
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

export async function fetchProfileData(did, pds) {
    const cacheKey = `profileData_${did}`;
    const expiryKey = `${cacheKey}_expiry`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const expiryTime = sessionStorage.getItem(expiryKey);

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
        sessionStorage.setItem(cacheKey, JSON.stringify(profileData));
        sessionStorage.setItem(expiryKey, Date.now() + expiryInMs); // Set expiry time

        return profileData;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
}