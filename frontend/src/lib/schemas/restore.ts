import { z } from 'zod';
export const restoreSchema = z.object({
  snapshot_id: z.string().min(1, 'Select a snapshot'),
  restore_to: z.string().min(1, 'Restore destination is required'),
  overwrite: z.boolean().default(false),
  dry_run: z.boolean().default(false),
});
