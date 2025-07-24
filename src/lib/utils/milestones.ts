import { formatNumber, getOrdinalSuffix } from "$utils/formatters";

export interface Milestone {
  text: string;
  emoji: string;
  type: 'special' | 'major' | 'minor';
}

/**
 * Determines if a post number represents a milestone and returns milestone info
 */
export function getMilestone(postNumber: number): Milestone | null {
  // Special milestones defined in a more maintainable structure.
  const specialMilestones: { number: number; text: string; emoji: string; }[] = [
    { number: 1, text: "First Post!", emoji: "🎉" },
    { number: 100, text: "Centennial Post!", emoji: "💯" },
    { number: 365, text: "Daily Dose Complete!", emoji: "📅" },
    { number: 500, text: "Half Thousand!", emoji: "🏆" },
    { number: 1000, text: "One Thousand Posts!", emoji: "🌟" },
    { number: 10000, text: "Ten Thousand Posts!", emoji: "🚀" },
    { number: 200, text: "Double Century!", emoji: "🎉🎉" },
    { number: 250, text: "Quarter Thousand!", emoji: "✨✨" },
    { number: 750, text: "Three-Quarter Thousand!", emoji: "💫💫" },
  ];

  for (const milestone of specialMilestones) {
    if (postNumber === milestone.number) {
      return {
        text: milestone.text,
        emoji: milestone.emoji,
        type: 'special'
      };
    }
  }
  
  // Major milestones (every 50 posts after 100)
  if (postNumber > 100 && postNumber % 250 === 0) {
    return {
      text: `${formatNumber(postNumber)} Posts!`,
      emoji: "🎉",
      type: 'major'
    };
  }

  if (postNumber > 100 && postNumber % 50 === 0) {
    return {
      text: `${formatNumber(postNumber)} Posts!`,
      emoji: "🎯",
      type: 'major'
    };
  }

  // Specific major milestone that doesn't fit the general rule.
  if (postNumber === 150) {
    return {
      text: "One Hundred Fifty Posts!",
      emoji: "🎉",
      type: 'major'
    };
  }
  
  // Minor milestones (every 10 posts, but not major milestones).
  // This check should come after special and major milestones to ensure correct precedence.
  if (postNumber % 10 === 0 && postNumber % 50 !== 0) {
    const ordinal = getOrdinal(postNumber);
    return {
      text: `${ordinal} Post!`,
      emoji: "✨",
      type: 'minor'
    };
  }
  
  // Very special fun ones that are not part of the main special milestones array.
  const funMilestones: { number: number; text: string; emoji: string; }[] = [
    { number: 22, text: "My Lucky Number!", emoji: "🍀" },
    { number: 42, text: "Answer to Everything!", emoji: "🤖" },
    { number: 69, text: "Nice!", emoji: "😎" },
    { number: 404, text: "Post Not Found!", emoji: "🔍" },
    { number: 123, text: "One Two Three!", emoji: "🔢" },
    { number: 333, text: "Triple Three!", emoji: "✨✨✨" },
  ];

  for (const milestone of funMilestones) {
    if (postNumber === milestone.number) {
      return {
        text: milestone.text,
        emoji: milestone.emoji,
        type: 'special'
      };
    }
  }
  
  return null;
}

/**
 * Converts a number to its ordinal form (1st, 2nd, 3rd, etc.)
 */

function getOrdinal(num: number): string {
  const formatted = formatNumber(num);
  return formatted + getOrdinalSuffix(num);
}