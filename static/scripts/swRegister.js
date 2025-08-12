console.log('Service Worker registration script loaded');
console.log('Current location:', window.location.href);

if ('serviceWorker' in navigator) {
  console.log('Service Worker API supported');

  window.addEventListener('load', () => {
    const swPath = '/sw.js'; // Must live in static/sw.js
    console.log(`Attempting to register Service Worker at: ${swPath}`);

    // Step 1 – Verify file is accessible
    fetch(swPath, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} – ${response.statusText}`);
        }
        console.log('Service worker file accessible:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });

        // Step 2 – Register the service worker
        return navigator.serviceWorker.register(swPath);
      })
      .then(registration => {
        console.log('Service Worker registered successfully:', {
          scope: registration.scope,
          active: !!registration.active,
          waiting: !!registration.waiting,
          installing: !!registration.installing
        });

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker installed and ready');
            }
          });
        });
      })
      .catch(error => {
        console.error('Service Worker setup failed:', error);
        console.log('Debug info:', {
          location: window.location.href,
          userAgent: navigator.userAgent,
          https: window.location.protocol === 'https:',
          localhost: window.location.hostname === 'localhost'
        });
      });
  });
} else {
  console.warn('Service Worker not supported in this browser');
}