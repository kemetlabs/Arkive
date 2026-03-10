import { api } from './client';
import type { NotificationChannel, PaginatedResponse } from '$lib/types';

export async function listChannels(): Promise<PaginatedResponse<NotificationChannel>> {
  return api.get('/notifications');
}

export async function createChannel(data: Record<string, unknown>): Promise<NotificationChannel> {
  return api.post('/notifications', data);
}

export async function updateChannel(id: string, data: Record<string, unknown>): Promise<NotificationChannel> {
  return api.put(`/notifications/${id}`, data);
}

export async function deleteChannel(id: string): Promise<void> {
  return api.delete(`/notifications/${id}`);
}

export async function testChannel(id: string): Promise<{ success: boolean; message: string }> {
  return api.post(`/notifications/${id}/test`);
}
