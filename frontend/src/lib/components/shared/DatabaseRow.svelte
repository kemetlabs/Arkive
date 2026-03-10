<script lang="ts">
  import ProviderIcon from './ProviderIcon.svelte';
  import type { DiscoveredDatabase } from '$lib/types';

  export let database: DiscoveredDatabase;
  export let onDump: ((db: DiscoveredDatabase) => void) | undefined = undefined;
</script>

<div class="flex items-center justify-between py-3 px-4 border-b border-border-muted hover:bg-hover transition-colors">
  <div class="flex items-center gap-3">
    <ProviderIcon provider={database.db_type} size="sm" />
    <div>
      <span class="text-sm font-medium text-text-primary">{database.db_name}</span>
      <div class="text-xs text-text-secondary">
        {database.container_name} · {database.db_type}
      </div>
    </div>
  </div>
  <div class="flex items-center gap-2">
    {#if database.host_path}
      <span class="text-xs font-mono text-text-secondary truncate max-w-[200px]">{database.host_path}</span>
    {/if}
    {#if onDump}
      <button
        on:click={() => onDump?.(database)}
        class="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        Dump Now
      </button>
    {/if}
  </div>
</div>
