import type { RequestHandler } from "./$types";
import { Resvg } from "@resvg/resvg-js";

export const GET: RequestHandler = async ({ setHeaders }) => {
  // Test: Can we render a simple shape?
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="red" />
    </svg>
  `.trim();

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 100 },
  });

  const pngData = resvg.render();

  setHeaders({
    "Content-Type": "image/png",
  });

  return new Response(pngData.asPng());
};
