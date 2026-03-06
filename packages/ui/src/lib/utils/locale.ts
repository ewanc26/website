export function getUserLocale(): string {
	if (typeof navigator !== 'undefined') return navigator.language || 'en-GB';
	return 'en-GB';
}

export function formatLocalizedDate(dateString: string, locale?: string): string {
	const date = new Date(dateString);
	const userLocale = locale || getUserLocale();
	return date.toLocaleDateString(userLocale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);
	if (diffMins < 1) return 'just now';
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	const userLocale = getUserLocale();
	return date.toLocaleDateString(userLocale, {
		day: 'numeric',
		month: 'short',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
	});
}
