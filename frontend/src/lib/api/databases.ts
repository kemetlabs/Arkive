import { api } from './client';
import type { DiscoveredDatabase, PaginatedResponse } from '$lib/types';

export async function listDatabases(): Promise<PaginatedResponse<DiscoveredDatabase>> {
  return api.get('/databases');
}

export async function dumpDatabase(containerName: string, dbName: string): Promise<{ status: string }> {
  return api.post(`/databases/${containerName}/${dbName}/dump`);
}
