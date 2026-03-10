import { writable } from 'svelte/store';

export interface BrowserSession {
	setup_required: boolean;
	authenticated?: boolean;
	setup_completed_at?: string;
}

export const authenticated = writable(false);
export const setupRequired = writable(false);
export const setupCompletedAt = writable<string | null>(null);

export function applySession(session: BrowserSession) {
	setupRequired.set(Boolean(session.setup_required));
	authenticated.set(Boolean(session.authenticated));
	setupCompletedAt.set(session.setup_completed_at ?? null);
}

export function clearSession() {
	authenticated.set(false);
	setupCompletedAt.set(null);
}
