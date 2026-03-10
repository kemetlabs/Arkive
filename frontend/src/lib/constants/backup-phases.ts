export const BACKUP_PHASES = [
  { key: 'discovering', label: 'Discovery' },
  { key: 'dumping_databases', label: 'DB Dumps' },
  { key: 'flash_backup', label: 'Flash' },
  { key: 'uploading', label: 'Upload' },
  { key: 'retention_cleanup', label: 'Retention' },
  { key: 'refreshing_snapshots', label: 'Snapshots' },
] as const;

export type BackupPhaseKey = typeof BACKUP_PHASES[number]['key'];

export function phaseToIndex(phase: string): number {
  const normalized = phase.split(':')[0];  // handle 'uploading:target-name' format
  const idx = BACKUP_PHASES.findIndex(p => p.key === normalized);
  return idx >= 0 ? idx : BACKUP_PHASES.length - 1;  // fallback to last phase, not first
}
