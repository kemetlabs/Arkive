import { api } from './client';

export async function getCronPreview(expr: string): Promise<{ next_runs: string[] }> {
  return api.get(`/settings/cron-preview?expr=${encodeURIComponent(expr)}`);
}
