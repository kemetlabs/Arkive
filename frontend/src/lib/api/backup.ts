import { api } from './client';
import type { BackupJob, JobRun, PaginatedResponse } from '$lib/types';

export async function listJobs(): Promise<PaginatedResponse<BackupJob>> {
  return api.get('/jobs');
}

export async function getJob(id: string): Promise<BackupJob> {
  return api.get(`/jobs/${id}`);
}

export async function createJob(data: Partial<BackupJob>): Promise<BackupJob> {
  return api.post('/jobs', data);
}

export async function updateJob(id: string, data: Partial<BackupJob>): Promise<BackupJob> {
  return api.put(`/jobs/${id}`, data);
}

export async function deleteJob(id: string): Promise<void> {
  return api.delete(`/jobs/${id}`);
}

export async function triggerJob(id: string): Promise<JobRun> {
  return api.post(`/jobs/${id}/run`);
}

export async function cancelJob(id: string): Promise<void> {
  return api.delete(`/jobs/${id}/run`);
}

export async function listRuns(params?: { job_id?: string; status?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<JobRun>> {
  const query = new URLSearchParams();
  if (params?.job_id) query.set('job_id', params.job_id);
  if (params?.status) query.set('status', params.status);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));
  return api.get(`/jobs/runs?${query}`);
}

export async function getRun(id: string): Promise<JobRun> {
  return api.get(`/jobs/runs/${id}`);
}

export const backupApi = {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  triggerJob,
  cancelJob,
  listRuns,
  getRun,
};
