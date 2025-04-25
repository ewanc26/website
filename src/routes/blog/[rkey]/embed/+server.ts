import { formatDate } from '$lib/dateFormatter';
import type { RequestHandler } from '@sveltejs/kit';

// Simple SVG template function
function createSvg(post: {title: string, createdAt: string}, profile: {displayName?: string, avatar?: string, handle?: string}, width = 1200, height = 630) {
    // Truncate title if too long
    const truncatedTitle = post.title.length > 60 
        ? post.title.substring(0, 57) + '...' 
        : post.title;
    
    // Format date
    const date = new Date(post.createdAt);
    let formattedDate;
    try {
        formattedDate = formatDate(date);
    } catch {
        formattedDate = date.toLocaleDateString();
    }
    
    // Generate SVG
    return `<svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 ${width} ${height}" 
        width="${width}" 
        height="${height}"
    >
        <!-- Background -->
        <rect width="100%" height="100%" fill="#121c17" />
        
        <!-- Border -->
        <rect 
          x="10" 
          y="10" 
          width="${width - 20}" 
          height="${height - 20}" 
          stroke="#1e2c23" 
          stroke-width="2" 
          fill="none" 
        />
        
        <!-- Title with wrapping -->
        <text 
          x="60" 
          y="150" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="48" 
          font-weight="bold" 
          fill="#d8e8d8"
          width="1080"
        >
          ${truncatedTitle.length > 40 ? 
            truncatedTitle.match(/.{1,40}(\s|$)/g)?.map((line: string, i: number) => 
              `<tspan x="60" dy="${i === 0 ? 0 : 60}">${line}</tspan>`
            ).join('') : 
            `<tspan>${truncatedTitle}</tspan>`
          }
        </text>
        
        <!-- Date -->
        <text 
          x="60" 
          y="${truncatedTitle.length > 40 ? 210 + ((truncatedTitle.match(/.{1,40}(\s|$)/g) || []).length - 1) * 60 : 210}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="24" 
          fill="#8fd0a0"
        >${formattedDate}</text>

        <!-- Bottom section with author info -->
        <rect 
          x="0" 
          y="${height - 100}" 
          width="${width}" 
          height="100" 
          fill="#1e2c23" 
        />
        
        <!-- For server-side SVG, we'll use a simple approach since foreignObject might not be supported everywhere -->
        <image 
          x="30" 
          y="${height - 80}" 
          width="60" 
          height="60" 
          href="${profile?.avatar || ''}" 
          clip-path="circle(30px at 30px 30px)"
          preserveAspectRatio="xMidYMid slice"
        />
        <!-- Fallback circle (appears if image fails to load) -->
        <circle 
          cx="60" 
          cy="${height - 50}" 
          r="30" 
          fill="#a0aec0" 
          stroke="#f8f9fa" 
          stroke-width="2" 
        />
        
        <!-- Author name -->
        <text 
          x="110" 
          y="${height - 55}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="24" 
          font-weight="bold" 
          fill="#d8e8d8"
        >${profile?.displayName || 'Unknown Author'}</text>
        
        <!-- Author handle -->
        <text 
          x="110" 
          y="${height - 25}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="18" 
          fill="#8fd0a0"
        >@${profile?.handle || 'unknown'}</text>
        
        <!-- Logo or site brand -->
        <text 
          x="${width - 60}" 
          y="${height - 40}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="24" 
          font-weight="bold" 
          text-anchor="end" 
          fill="#d8e8d8"
        >Ewan's Blog</text>
    </svg>`;
}

export const GET: RequestHandler = async ({ params, fetch }) => {
    // Need to fetch post data - we can't directly use load functions
    try {
        // Get the parent path and use fetch API to get the data
        const response = await fetch(`/blog/${params.rkey}`);
        if (!response.ok) {
            return new Response('Post not found', { status: 404 });
        }
        
        const html = await response.text();
        
        // This is a bit hacky, but we're extracting the data from the HTML
        // In a real app, you might want to create a dedicated API endpoint
        // or pass the data through context/stores
        
        // For simplicity, let's simulate having the data
        // In a real app, you would need to extract this data properly
        const dataMatch = html.match(/<script[^>]*id="sveltekit-data"[^>]*>([^<]+)<\/script>/);
        let data;
        
        if (dataMatch && dataMatch[1]) {
            try {
                data = JSON.parse(decodeURIComponent(dataMatch[1]));
                // Extract the specific route data
                const routeData = data.nodes?.[1]?.data;
                
                if (routeData?.post && routeData?.profile) {
                    const svg = createSvg(routeData.post, routeData.profile);
                    return new Response(svg, {
                        headers: {
                            'Content-Type': 'image/svg+xml',
                            'Cache-Control': 'public, max-age=3600'
                        }
                    });
                }
            } catch (e: unknown) {
                console.error('Error parsing data:', e);
            }
        }
        
        // Fallback with a basic SVG if we couldn't extract the data
        return new Response(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
                <rect width="100%" height="100%" fill="#f8f9fa" />
                <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="48" text-anchor="middle" fill="#1a202c">
                    Blog Post Image
                </text>
            </svg>
        `, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=60'
            }
        });
    } catch (error) {
        console.error('Error generating embed image:', error);
        return new Response('Error generating image', { status: 500 });
    }
};
