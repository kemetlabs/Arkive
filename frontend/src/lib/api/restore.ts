import { api } from './client';
import type { Snapshot, FileNode, PaginatedResponse } from '$lib/types';

export async function listSnapshots(targetId?: string): Promise<PaginatedResponse<Snapshot>> {
  const query = targetId ? `?target_id=${targetId}` : '';
  return api.get(`/snapshots${query}`);
}

export async function browseSnapshot(snapshotId: string, path: string = '/'): Promise<FileNode[]> {
  return api.get(`/snapshots/${snapshotId}/browse?path=${encodeURIComponent(path)}`);
}

export async function restoreFiles(data: {
  snapshot_id: string;
  target_id: string;
  paths: string[];
  restore_to: string;
  overwrite?: boolean;
  dry_run?: boolean;
}): Promise<{ status: string; run_id: string }> {
  return api.post('/restore', data);
}

export async function getRestorePlan(): Promise<{ markdown: string }> {
  return api.get('/restore/plan');
}

export async function downloadRestorePlanPdf(): Promise<Blob> {
  const response = await fetch('/api/restore/plan/pdf', {
    credentials: 'include',
  });
  return response.blob();
}

export async function testRestore(): Promise<{ success: boolean; message: string; file_tested: string }> {
  return api.post('/restore/test');
}
