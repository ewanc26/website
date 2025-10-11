import type { PageServerLoad } from './$types';
import { loadAllPosts } from '$lib/services/blogService';

export const load: PageServerLoad = async ({ fetch }) => {
  const blogService = await loadAllPosts(fetch);
  
  // Group posts by year/month on server
  const groupedByYear = groupPosts(blogService.sortedPosts);
  
  return {
    profile: blogService.profile,
    groupedByYear,
    totalPosts: blogService.sortedPosts.length
  };
};

function groupPosts(posts: any[]) {
  const grouped = new Map();
  
  for (const post of posts) {
    const year = post.createdAt.getFullYear();
    const month = post.createdAt.toLocaleString('en-GB', { month: 'long' });
    
    if (!grouped.has(year)) {
      grouped.set(year, new Map());
    }
    
    const yearMap = grouped.get(year);
    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }
    
    yearMap.get(month).push(post);
  }
  
  // Convert to array format
  return Array.from(grouped.entries()).map(([year, months]) => ({
    year,
    months: Object.fromEntries(months)
  })).sort((a, b) => b.year - a.year);
}
