import { z } from 'zod';
export const backupJobSchema = z.object({
  name: z.string().min(1, 'Job name is required').max(100),
  type: z.enum(['full', 'db_dump', 'flash']).optional(),
  schedule: z.string().min(1, 'Schedule is required'),
  targets: z.array(z.string()).min(1, 'Select at least one target'),
  include_databases: z.boolean().default(true),
  include_flash: z.boolean().default(true),
  directories: z.array(z.string()).default([]),
  exclude_patterns: z.array(z.string()).default([]),
});
