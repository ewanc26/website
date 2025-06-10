import type { Post } from "$lib/parser";
import type { Profile } from "$lib/components/profile/profile";

export const GET = async ({
  params,
  parent: getParent,
}: {
  params: { rkey: string };
  parent: () => Promise<{
    getPost: (rkey: string) => Post | undefined;
    profile: Profile;
  }>;
}) => {
  try {
    const { getPost, profile } = await getParent();
    const post = getPost(params.rkey);

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    // Create SVG with post details
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#gradient)"/>
        
        <!-- Content container -->
        <rect x="60" y="60" width="1080" height="510" fill="rgba(255,255,255,0.95)" rx="12"/>
        
        <!-- Title -->
        <text x="100" y="200" font-family="system-ui, -apple-system, sans-serif" 
              font-size="48" font-weight="bold" fill="#1f2937" 
              text-anchor="start" dominant-baseline="middle">
          ${escapeXml(truncateText(post.title, 50))}
        </text>
        
        <!-- Excerpt -->
        <text x="100" y="280" font-family="system-ui, -apple-system, sans-serif" 
              font-size="24" fill="#6b7280" 
              text-anchor="start" dominant-baseline="middle">
          ${escapeXml(
            truncateText(post.excerpt || "Read more on Ewan's Corner", 80)
          )}
        </text>
        
        <!-- Author and stats -->
        <text x="100" y="450" font-family="system-ui, -apple-system, sans-serif" 
              font-size="18" fill="#9ca3af" 
              text-anchor="start" dominant-baseline="middle">
          By ${escapeXml(profile?.displayName || profile?.handle || "Ewan")} • 
          ${Math.ceil(post.wordCount / 200)} min read • 
          ${post.wordCount} words
        </text>
        
        <!-- Date -->
        <text x="100" y="480" font-family="system-ui, -apple-system, sans-serif" 
              font-size="16" fill="#9ca3af" 
              text-anchor="start" dominant-baseline="middle">
                    ${post.createdAt.toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
        </text>
        
        <!-- Logo/Site name -->
        <text x="1100" y="520" font-family="system-ui, -apple-system, sans-serif" 
              font-size="20" font-weight="600" fill="#3b82f6" 
              text-anchor="end" dominant-baseline="middle">
          Ewan's Corner
        </text>
      </svg>
    `;

    // Convert SVG to PNG using built-in canvas if available, or return SVG
    try {
      // Try to use @resvg/resvg-js for better PNG conversion
      const { Resvg } = await import("@resvg/resvg-js");
      const resvg = new Resvg(svg, {
        background: "white",
        fitTo: {
          mode: "width",
          value: 1200,
        },
      });
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      return new Response(pngBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
      });
    } catch {
      // Fallback to SVG if PNG conversion fails
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch (error) {
    console.error("Error generating embed image:", error);

    // Return a simple fallback image
    const fallbackSvg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#3b82f6"/>
        <text x="600" y="315" font-family="system-ui, sans-serif" 
              font-size="48" font-weight="bold" fill="white" 
              text-anchor="middle" dominant-baseline="middle">
          Blog - Ewan's Corner
        </text>
      </svg>
    `;

    return new Response(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
