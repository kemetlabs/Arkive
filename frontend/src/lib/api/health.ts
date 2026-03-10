import { api } from './client';
import type { SystemStatus } from '$lib/types';

export async function getStatus(): Promise<SystemStatus> {
  return api.get('/status');
}
