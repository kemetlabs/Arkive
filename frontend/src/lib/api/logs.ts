import { api } from './client';

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  component: string;
  message: string;
  details?: Record<string, unknown>;
}

export async function getLogs(params?: {
  level?: string;
  component?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: LogEntry[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.level) query.set('level', params.level);
  if (params?.component) query.set('component', params.component);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));
  return api.get(`/logs?${query}`);
}
