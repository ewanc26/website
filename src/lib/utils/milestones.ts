import { formatNumber } from "$utils/formatters";

export interface Milestone {
  text: string;
  emoji: string;
  type: 'special' | 'major' | 'minor';
}

/**
 * Determines if a post number represents a milestone and returns milestone info
 */
export function getMilestone(postNumber: number): Milestone | null {
  // Special milestones
  // Special milestones
  if (postNumber === 1) {
    return {
      text: "First Post!",
      emoji: "🎉",
      type: 'special'
    };
  }
  
  if (postNumber === 100) {
    return {
      text: "Centennial Post!",
      emoji: "💯",
      type: 'special'
    };
  }
  
  if (postNumber === 365) {
    return {
      text: "Daily Dose Complete!",
      emoji: "📅",
      type: 'special'
    };
  }
  
  if (postNumber === 500) {
    return {
      text: "Half Thousand!",
      emoji: "🏆",
      type: 'special'
    };
  }
  
  if (postNumber === 1000) {
    return {
      text: "One Thousand Posts!",
      emoji: "🌟",
      type: 'special'
    };
  }
  
  // Major milestones (every 50 posts after 100)
  if (postNumber > 100 && postNumber % 50 === 0) {
    return {
      text: `${formatNumber(postNumber)} Posts!`,
      emoji: "🎯",
      type: 'major'
    };
  }
  
  // Minor milestones (every 10 posts, but not major milestones)
  if (postNumber % 10 === 0 && postNumber % 50 !== 0) {
    const ordinal = getOrdinal(postNumber);
    return {
      text: `${ordinal} Post!`,
      emoji: "✨",
      type: 'minor'
    };
  }
  
  // Very special fun ones
  if (postNumber === 42) {
    return {
      text: "Answer to Everything!",
      emoji: "🤖",
      type: 'special'
    };
  }
  
  if (postNumber === 69) {
    return {
      text: "Nice!",
      emoji: "😎",
      type: 'special'
    };
  }
  
  if (postNumber === 404) {
    return {
      text: "Post Not Found!",
      emoji: "🔍",
      type: 'special'
    };
  }
  
  return null;
}

/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, etc.)
 */
import { getOrdinalSuffix } from './formatters';

function getOrdinal(num: number): string {
  const formatted = formatNumber(num);
  return formatted + getOrdinalSuffix(num);
}