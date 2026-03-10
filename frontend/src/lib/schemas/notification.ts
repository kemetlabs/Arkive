import { z } from 'zod';
export const notificationSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['slack', 'discord', 'telegram', 'email', 'ntfy', 'gotify', 'pushover', 'webhook', 'uptimekuma', 'apprise']),
  url: z.string().min(1, 'Notification URL is required'),
  events: z.array(z.enum([
    'backup.success', 'backup.failed', 'backup.partial',
    'backup.started', 'restore.completed',
    'discovery.completed', 'target.error',
    'system.startup', 'system.shutdown', 'system.warning',
  ])).min(1, 'Select at least one event'),
  enabled: z.boolean().default(true),
});
