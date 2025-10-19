/**
 * OG (Open Graph) image paths
 * 
 * These images are served from the ./static/og/ directory.
 * They are accessible at /og/ URLs in the application.
 * 
 * To add new OG images:
 * 1. Place the image in ./static/og/
 * 2. Add the path here as /og/filename.png
 */
export const ogImages: Record<string, string> = {
  main: '/og/main.png',
  siteMeta: '/og/site-meta.png'
};
