/**
 * Validation and text processing utilities
 */

/**
 * Validates AT Protocol TID (Timestamp Identifier) format
 * @param tid - The TID to validate
 * @returns True if valid TID format
 */
export function isValidTid(tid: string): boolean {
	// TIDs are base32-encoded timestamps, 12-16 alphanumeric characters
	const tidPattern = /^[a-zA-Z0-9]{12,16}$/;
	return tidPattern.test(tid);
}

/**
 * Validates AT Protocol DID format
 * @param did - The DID to validate
 * @returns True if valid DID format
 */
export function isValidDid(did: string): boolean {
	// DID format: did:method:identifier
	const didPattern = /^did:[a-z]+:[a-zA-Z0-9._:-]+$/;
	return didPattern.test(did);
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - String to append when truncated (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, ellipsis = '...'): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - ellipsis.length).trim() + ellipsis;
}

/**
 * Safely escapes HTML to prevent XSS attacks
 * @param text - The text to escape
 * @returns HTML-safe text
 */
export function escapeHtml(text: string): string {
	const div = typeof document !== 'undefined' ? document.createElement('div') : null;
	if (div) {
		div.textContent = text;
		return div.innerHTML;
	}
	// Server-side fallback
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Generates initials from a name (max 2 characters)
 * @param name - The name to generate initials from
 * @returns Uppercase initials
 */
export function getInitials(name: string): string {
	const words = name.trim().split(/\s+/);
	if (words.length === 1) {
		return words[0].charAt(0).toUpperCase();
	}
	return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Debounces a function call
 * @param func - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

/**
 * Throttles a function call
 * @param func - The function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}
