export function isValidTid(tid: string): boolean {
	const tidPattern = /^[a-zA-Z0-9]{12,16}$/;
	return tidPattern.test(tid);
}

export function isValidDid(did: string): boolean {
	const didPattern = /^did:[a-z]+:[a-zA-Z0-9._:-]+$/;
	return didPattern.test(did);
}

export function truncateText(text: string, maxLength: number, ellipsis = '...'): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - ellipsis.length).trim() + ellipsis;
}

export function escapeHtml(text: string): string {
	const div = typeof document !== 'undefined' ? document.createElement('div') : null;
	if (div) {
		div.textContent = text;
		return div.innerHTML;
	}
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export function getInitials(name: string): string {
	const words = name.trim().split(/\s+/);
	if (words.length === 1) return words[0].charAt(0).toUpperCase();
	return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

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
