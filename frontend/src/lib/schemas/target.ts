import { z } from 'zod';
export const targetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['b2', 'dropbox', 'gdrive', 's3', 'local', 'sftp', 'wasabi']),
  key_id: z.string().optional(),
  app_key: z.string().optional(),
  bucket: z.string().optional(),
  token: z.string().optional(),
  endpoint: z.string().url().optional().or(z.literal('')),
  access_key: z.string().optional(),
  secret_key: z.string().optional(),
  path: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  remote_path: z.string().optional(),
}).refine(data => {
  if (data.type === 'b2') return data.key_id && data.app_key && data.bucket;
  if (data.type === 'local') return data.path;
  if (data.type === 'dropbox' || data.type === 'gdrive') return data.token;
  if (data.type === 's3') return data.endpoint && data.access_key && data.secret_key && data.bucket;
  if (data.type === 'sftp') return data.host && data.username;
  if (data.type === 'wasabi') return data.access_key && data.secret_key && data.bucket;
  return true;
}, { message: 'Required fields missing for selected target type' });
