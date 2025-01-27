import { fetchProfileData } from './profile.js';

export async function injectProfileData(did) {
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

        // Inject avatar with alt text for accessibility
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