import { writable, derived } from 'svelte/store';
import type { SystemStatus } from '$lib/types';
import { getStatus } from '$lib/api/health';

export const status = writable<SystemStatus | null>(null);
export const loading = writable(true);
export const error = writable<string | null>(null);

export const isSetupComplete = derived(status, ($status) => $status?.setup_complete ?? false);
export const isBackupRunning = derived(status, ($status) => $status?.backup_running ?? false);

export async function refreshStatus() {
  try {
    loading.set(true);
    error.set(null);
    const data = await getStatus();
    status.set(data);
  } catch (e) {
    error.set(e instanceof Error ? e.message : 'Failed to fetch status');
  } finally {
    loading.set(false);
  }
}
