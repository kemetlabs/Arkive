import { api } from './client';

export const directoriesApi = {
  list: () => api.get<{ items: any[]; total: number }>('/directories'),
  create: (data: { path: string; label?: string }) => api.post('/directories', data),
  remove: (id: string) => api.delete(`/directories/${id}`),
};
