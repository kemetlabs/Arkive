/** Realistic test data matching API response shapes. */

export const mockTargets = [
  {
    id: 't1',
    name: 'Local Backup',
    type: 'local',
    enabled: true,
    status: 'healthy',
    snapshot_count: 12,
    total_size_bytes: 1073741824,
    config: { path: '/mnt/user/backups' },
  },
];

export const mockSnapshots = [
  {
    id: 'snap1',
    target_id: 't1',
    full_id: 'snap1fullid123',
    time: '2024-06-15T10:00:00Z',
    hostname: 'unraid-server',
    paths: ['/mnt/user/appdata'],
    tags: [],
    size_bytes: 524288000,
  },
];

export const mockActivity = [
  {
    id: 1,
    type: 'backup',
    action: 'completed',
    message: 'Backup completed successfully',
    severity: 'info',
    timestamp: '2024-06-15T10:30:00Z',
  },
  {
    id: 2,
    type: 'discovery',
    action: 'scan_triggered',
    message: 'Container discovery scan triggered',
    severity: 'info',
    timestamp: '2024-06-15T10:00:00Z',
  },
];

export const mockJobs = [
  {
    id: 'j1',
    name: 'DB Dumps',
    type: 'db_dump',
    schedule: '0 1 * * *',
    enabled: true,
    targets: [],
    directories: [],
  },
  {
    id: 'j2',
    name: 'Cloud Sync',
    type: 'full',
    schedule: '0 2 * * *',
    enabled: true,
    targets: ['t1'],
    directories: [],
  },
  {
    id: 'j3',
    name: 'Flash Backup',
    type: 'flash',
    schedule: '0 3 * * *',
    enabled: true,
    targets: [],
    directories: [],
  },
];
