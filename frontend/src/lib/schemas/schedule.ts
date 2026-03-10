import { z } from 'zod';
export const cronRegex = /^[\d*\/,-]+\s[\d*\/,-]+\s[\d*\/,-]+\s[\d*\/,-]+\s[\d*\/,-]+$/;
export const cronSchema = z.string().regex(cronRegex, 'Invalid cron expression');
export const scheduleSchema = z.object({
  db_dump_cron: cronSchema,
  cloud_sync_cron: cronSchema,
  flash_backup_cron: cronSchema,
});
