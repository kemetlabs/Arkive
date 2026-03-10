import { writable, derived } from 'svelte/store';

export const theme = writable<'dark' | 'light'>('dark');
export const sidebarOpen = writable(true);
export const setupCompleted = writable(false);
export const apiKey = writable('');
export const isLoading = writable(false);
export const backupRunning = writable(false);

// Status
export const systemStatus = writable<any>(null);

// Notifications toast
export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>) {
	const id = Math.random().toString(36).slice(2);
	toasts.update((t) => [...t, { ...toast, id }]);
	setTimeout(() => {
		toasts.update((t) => t.filter((x) => x.id !== id));
	}, toast.duration || 5000);
}

// Theme toggle
export function toggleTheme() {
	theme.update((t) => {
		const next = t === 'dark' ? 'light' : 'dark';
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', next === 'dark');
			document.documentElement.classList.toggle('light', next === 'light');
			localStorage.setItem('arkive_theme', next);
		}
		return next;
	});
}

export function initTheme() {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('arkive_theme') as 'dark' | 'light' | null;
		const t = saved || 'dark';
		theme.set(t);
		document.documentElement.classList.toggle('dark', t === 'dark');
		document.documentElement.classList.toggle('light', t === 'light');
	}
}
