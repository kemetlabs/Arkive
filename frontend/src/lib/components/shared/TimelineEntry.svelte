<script lang="ts">
  import StatusBadge from './StatusBadge.svelte';
  import { timeAgo } from '$lib/utils/date';
  import type { ActivityEntry } from '$lib/types';

  export let entry: ActivityEntry;

  const dotColors: Record<string, string> = {
    info: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-danger',
  };

  $: dotColor = dotColors[entry.severity] || dotColors[entry.type] || 'bg-primary';
</script>

<div class="relative flex items-start gap-4 pl-6 py-3 rounded-lg bg-bg-surface hover:bg-bg-surface-hover transition-colors">
  <!-- Colored dot with border to clip connector line -->
  <div class="absolute left-0 top-[18px] w-[9px] h-[9px] rounded-full shrink-0 border-2 border-bg-base {dotColor}"></div>

  <!-- Content -->
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-sm text-text">{entry.message}</span>
      <StatusBadge status={entry.severity} size="sm" />
    </div>
    <div class="text-xs text-text-secondary mt-0.5 font-mono">
      {timeAgo(entry.timestamp)} · {entry.action}
    </div>
  </div>
</div>
