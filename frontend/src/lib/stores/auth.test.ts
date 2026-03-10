import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

async function loadAuthModule() {
	vi.resetModules();
	return import('./auth');
}

describe('auth store', () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
	});

	it('starts unauthenticated before session bootstrap', async () => {
		const auth = await loadAuthModule();

		expect(get(auth.authenticated)).toBe(false);
		expect(get(auth.setupRequired)).toBe(false);
	});

	it('applySession syncs browser auth state from the backend session payload', async () => {
		const auth = await loadAuthModule();

		auth.applySession({
			setup_required: false,
			authenticated: true,
			setup_completed_at: '2026-03-06T00:00:00Z',
		});

		expect(get(auth.authenticated)).toBe(true);
		expect(get(auth.setupRequired)).toBe(false);
		expect(get(auth.setupCompletedAt)).toBe('2026-03-06T00:00:00Z');
	});

	it('clearSession resets the browser auth state', async () => {
		const auth = await loadAuthModule();
		auth.applySession({ setup_required: false, authenticated: true });

		auth.clearSession();

		expect(get(auth.authenticated)).toBe(false);
		expect(get(auth.setupCompletedAt)).toBeNull();
	});
});
