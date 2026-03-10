import { api } from './client';

export const jobsApi = {
  list: () => api.get<{ items: any[]; total: number }>('/jobs'),
  get: (id: string) => api.get(`/jobs/${id}`),
  create: (data: any) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  remove: (id: string) => api.delete(`/jobs/${id}`),
  run: (id: string) => api.post(`/jobs/${id}/run`),
};
