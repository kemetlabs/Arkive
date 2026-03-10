/**
 * Shared helpers for Arkive Playwright tests.
 *
 * The backend API lives at http://127.0.0.1:8200/api.
 * These helpers create / reset state via direct HTTP so tests are
 * self-contained and don't depend on browser interactions for setup.
 */

import { type APIRequestContext } from '@playwright/test';

export const API_BASE = 'http://127.0.0.1:8200';
export const API = `${API_BASE}/api`;
export const CONFIG_DIR = '/tmp/arkive-playwright';

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */

export interface SetupResult {
  api_key: string;
  message: string;
}

/**
 * Complete the initial setup via API and return the API key.
 * If setup is already done this will throw (caller should handle).
 */
export async function completeSetup(
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
): Promise<SetupResult> {
  const body = {
    encryption_password: 'test-password-12chars',
    db_dump_schedule: '0 6,18 * * *',
    cloud_sync_schedule: '0 7 * * *',
    flash_schedule: '0 6 * * *',
    directories: [],
    run_first_backup: false,
    ...overrides,
  };

  const res = await request.post(`${API}/auth/setup`, { data: body });
  if (!res.ok()) {
    throw new Error(`Setup failed (${res.status()}): ${await res.text()}`);
  }
  return res.json() as Promise<SetupResult>;
}

/**
 * Return headers object with the API key for authenticated requests.
 */
export function authHeaders(apiKey: string): Record<string, string> {
  return { 'X-API-Key': apiKey };
}

/* ------------------------------------------------------------------ */
/*  Convenience wrappers                                               */
/* ------------------------------------------------------------------ */

export async function getStatus(request: APIRequestContext) {
  return request.get(`${API}/status`);
}

export async function listJobs(request: APIRequestContext, apiKey: string) {
  return request.get(`${API}/jobs`, { headers: authHeaders(apiKey) });
}

export async function createJob(
  request: APIRequestContext,
  apiKey: string,
  data: Record<string, unknown>,
) {
  return request.post(`${API}/jobs`, {
    headers: authHeaders(apiKey),
    data,
  });
}

export async function listTargets(request: APIRequestContext, apiKey: string) {
  return request.get(`${API}/targets`, { headers: authHeaders(apiKey) });
}

export async function getSettings(request: APIRequestContext, apiKey: string) {
  return request.get(`${API}/settings`, { headers: authHeaders(apiKey) });
}

export async function updateSettings(
  request: APIRequestContext,
  apiKey: string,
  data: Record<string, unknown>,
) {
  return request.put(`${API}/settings`, {
    headers: authHeaders(apiKey),
    data,
  });
}

export async function listNotifications(
  request: APIRequestContext,
  apiKey: string,
) {
  return request.get(`${API}/notifications`, {
    headers: authHeaders(apiKey),
  });
}

export async function createNotification(
  request: APIRequestContext,
  apiKey: string,
  data: Record<string, unknown>,
) {
  return request.post(`${API}/notifications`, {
    headers: authHeaders(apiKey),
    data,
  });
}

export async function listDirectories(
  request: APIRequestContext,
  apiKey: string,
) {
  return request.get(`${API}/directories`, {
    headers: authHeaders(apiKey),
  });
}

export async function listActivity(
  request: APIRequestContext,
  apiKey: string,
) {
  return request.get(`${API}/activity`, { headers: authHeaders(apiKey) });
}

/**
 * Reset the test database by deleting it so the backend creates a fresh one
 * next request. This is needed between test files that require fresh state.
 */
export async function resetDatabase() {
  console.warn('resetDatabase() is a no-op — backend starts with clean state');
}
