<script lang="ts">
  export let label: string;
  export let value: string | number;
  export let subtext: string = '';
  export let icon: string = '';
  export let trend: 'up' | 'down' | 'neutral' = 'neutral';
  export let trendValue: string = '';
</script>

<div class="bg-surface border border-border-muted rounded-lg p-4 flex flex-col gap-1">
  <div class="flex items-center justify-between">
    <span class="text-xs text-text-secondary uppercase tracking-wider font-medium">{label}</span>
    {#if icon}
      <span class="text-text-secondary text-sm">{icon}</span>
    {/if}
  </div>
  <div class="text-2xl font-semibold font-mono text-text-primary">{value}</div>
  {#if subtext || trendValue}
    <div class="flex items-center gap-1 text-xs">
      {#if trendValue}
        <span class:text-success={trend === 'up'} class:text-error={trend === 'down'} class:text-text-secondary={trend === 'neutral'}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </span>
      {/if}
      {#if subtext}
        <span class="text-text-secondary">{subtext}</span>
      {/if}
    </div>
  {/if}
</div>
