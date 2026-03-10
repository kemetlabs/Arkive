<script lang="ts">
  export let provider: 'b2' | 'dropbox' | 'gdrive' | 's3' | 'local' | 'sftp' | 'wasabi' | 'postgres' | 'sqlite' | 'mysql' | 'mariadb' | 'mongodb' | 'redis';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const colors: Record<string, string> = {
    b2: '#E41B21', dropbox: '#0061FF', gdrive: '#4285F4', s3: '#FF9900',
    local: '#8b949e', sftp: '#8b949e',
    wasabi: '#3DAA55',
    postgres: '#336791', sqlite: '#003B57', mysql: '#4479A1',
    mariadb: '#4479A1', mongodb: '#47A248', redis: '#DC382D',
  };

  const labels: Record<string, string> = {
    b2: 'B2', dropbox: 'DB', gdrive: 'GD', s3: 'S3',
    local: 'LC', sftp: 'SF',
    wasabi: 'WS',
    postgres: 'PG', sqlite: 'SL', mysql: 'MY',
    mariadb: 'MA', mongodb: 'MG', redis: 'RD',
  };

  const sizes: Record<string, string> = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };
</script>

<div
  class="rounded-md flex items-center justify-center font-bold text-white {sizes[size]}"
  style="background-color: {colors[provider] || '#8b949e'}"
>
  {labels[provider] || '??'}
</div>
