import { api } from './client';
import type { DiscoveredContainer } from '$lib/types';

export async function runDiscovery(): Promise<{ containers: DiscoveredContainer[]; total: number }> {
  return api.post('/discover/scan');
}

export async function completeSetup(data: {
  targets: Record<string, unknown>[];
  schedules: Record<string, string>;
  directories: string[];
  restic_password: string;
}): Promise<{ api_key: string; setup_complete: boolean }> {
  return api.post('/auth/setup', data);
}

export async function listDirectories(path?: string): Promise<{ directories: string[] }> {
  const query = path ? `?path=${encodeURIComponent(path)}` : '';
  return api.get(`/directories${query}`);
}
