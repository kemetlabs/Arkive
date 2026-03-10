import { api } from './client';
import type { StorageTarget, PaginatedResponse } from '$lib/types';

export async function listTargets(): Promise<PaginatedResponse<StorageTarget>> {
  return api.get('/targets');
}

export async function getTarget(id: string): Promise<StorageTarget> {
  return api.get(`/targets/${id}`);
}

export async function createTarget(data: Record<string, unknown>): Promise<StorageTarget> {
  return api.post('/targets', data);
}

export async function updateTarget(id: string, data: Record<string, unknown>): Promise<StorageTarget> {
  return api.put(`/targets/${id}`, data);
}

export async function deleteTarget(id: string): Promise<void> {
  return api.delete(`/targets/${id}`);
}

export async function testTarget(id: string): Promise<{ success: boolean; latency_ms: number; message: string }> {
  return api.post(`/targets/${id}/test`);
}
