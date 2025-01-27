import { fetchProfileData } from './profile.js';

export async function injectStatisticalData(did) {
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
