/**
 * Number formatting utilities
 */

/**
 * Formats large numbers into compact human-readable format
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export function formatCompactNumber(num?: number): string {
	if (!num) return '0';
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
	if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
	return num.toString();
}

/**
 * Formats a number with thousand separators
 * @param num - The number to format
 * @param locale - The locale to use (default: system locale)
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatNumber(num: number, locale?: string): string {
	const userLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-GB');
	return new Intl.NumberFormat(userLocale).format(num);
}
