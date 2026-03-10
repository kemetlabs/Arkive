import { api } from './client';
import type { ArkiveSettings } from '$lib/types';

export async function getSettings(): Promise<ArkiveSettings> {
  return api.get('/settings');
}

export async function updateSettings(data: Partial<ArkiveSettings>): Promise<ArkiveSettings> {
  return api.put('/settings', data);
}
