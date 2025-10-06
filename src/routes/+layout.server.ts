import { loadFonts } from '$lib/server/og/fonts';

let fontsWarmedUp = false;

export const load = async ({ url }) => {
  // Warm up fonts on first request (fire and forget)
  if (!fontsWarmedUp) {
    fontsWarmedUp = true;
    const baseUrl = url.origin.includes('localhost') 
      ? url.origin 
      : 'https://ewancroft.uk';
    
    // Don't await - let it warm up in background
    loadFonts(baseUrl)
      .then(() => console.log('✓ Fonts pre-loaded on first request'))
      .catch(err => console.error('Font pre-load failed:', err));
  }

  return {};
};
