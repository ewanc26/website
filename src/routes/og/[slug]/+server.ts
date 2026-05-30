import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { slug } = params;

  // A simple text-based SVG generator to demonstrate dynamic OG image creation.
  // In a production environment, this could be extended to use 'resvg'
  // for more complex layouts or rendering React/Svelte components.

  const svg = `
        <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#fcfcfc"/>
            <text x="600" y="315" font-family="sans-serif" font-size="60" text-anchor="middle" dominant-baseline="middle" fill="#333">
                ${slug.toUpperCase()}
            </text>
        </svg>
    `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
};
