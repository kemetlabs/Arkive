import { z } from 'zod';
export const settingsSchema = z.object({
  server_name: z.string().max(100).optional(),
  timezone: z.string().optional(),
  retention_days: z.number().int().min(1).max(365).optional(),
  keep_daily: z.number().int().min(1).max(365).optional(),
  keep_weekly: z.number().int().min(0).max(52).optional(),
  keep_monthly: z.number().int().min(0).max(24).optional(),
  log_level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).optional(),
});
