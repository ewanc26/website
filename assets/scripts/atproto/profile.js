export async function fetchProfileData(did) {
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
