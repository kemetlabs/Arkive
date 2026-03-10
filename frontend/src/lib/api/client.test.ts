import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadClientModule() {
	vi.resetModules();
	return import('./client');
}

describe('api client', () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends cookie-authenticated requests with browser credentials', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ status: 'ok' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		const { api } = await loadClientModule();
		const result = await api.getStatus();

		expect(result).toEqual({ status: 'ok' });
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/status',
			expect.objectContaining({
				credentials: 'include',
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
				}),
			})
		);
	});

	it('does not inject a legacy API key header', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ status: 'ok' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		const { api } = await loadClientModule();
		await api.getStatus();

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/status',
			expect.objectContaining({
				credentials: 'include',
				headers: expect.not.objectContaining({
					'X-API-Key': expect.any(String),
				}),
			})
		);
	});

	it('posts JSON login requests with browser credentials', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ authenticated: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		const { api } = await loadClientModule();
		await api.login('ark_login_key');

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/auth/login',
			expect.objectContaining({
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({ api_key: 'ark_login_key' }),
			})
		);
	});

	it('throws ApiError with the backend message when JSON error payload is present', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ message: 'Nope' }), {
				status: 401,
				statusText: 'Unauthorized',
				headers: { 'Content-Type': 'application/json' },
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		const { api, ApiError } = await loadClientModule();

		await expect(api.getStatus()).rejects.toEqual(new ApiError(401, 'Nope'));
	});

	it('falls back to the HTTP status text when the error body is not JSON', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response('bad gateway', {
				status: 502,
				statusText: 'Bad Gateway',
				headers: { 'Content-Type': 'text/plain' },
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		const { api, ApiError } = await loadClientModule();

		await expect(api.getStatus()).rejects.toEqual(new ApiError(502, 'Bad Gateway'));
	});
});
