import { writable, derived } from 'svelte/store';
import type { BackupJob, JobRun } from '$lib/types';
import * as backupApi from '$lib/api/backup';

export const jobs = writable<BackupJob[]>([]);
export const recentRuns = writable<JobRun[]>([]);
export const currentRun = writable<JobRun | null>(null);
export const loading = writable(false);

export const running = derived(currentRun, ($run) => $run?.status === 'running');

export async function loadJobs() {
  loading.set(true);
  try {
    const res = await backupApi.listJobs();
    jobs.set(res.items);
  } finally {
    loading.set(false);
  }
}

export async function loadRuns(limit = 10) {
  const res = await backupApi.listRuns({ limit });
  recentRuns.set(res.items);
  const runningRun = res.items.find(r => r.status === 'running');
  currentRun.set(runningRun || null);
}

export async function triggerBackup(jobId: string) {
  const run = await backupApi.triggerJob(jobId);
  currentRun.set(run);
  return run;
}
