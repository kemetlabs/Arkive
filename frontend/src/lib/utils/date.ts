export function timeAgo(dateStr: string): string {
	const now = new Date();
	const date = new Date(dateStr);
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (seconds < 60) return 'just now';
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
	if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
	return date.toLocaleDateString();
}

export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleString();
}

export const formatDateTime = formatDate;

export function formatDateShort(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString();
}
