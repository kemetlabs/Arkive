<script lang="ts">
  import StatusBadge from './StatusBadge.svelte';
  import ProviderIcon from './ProviderIcon.svelte';
  import { formatBytes } from '$lib/utils/format';
  import type { StorageTarget } from '$lib/types';

  export let target: StorageTarget;
  export let onTest: ((id: string) => void) | undefined = undefined;
  export let onEdit: ((id: string) => void) | undefined = undefined;
  export let onDelete: ((id: string) => void) | undefined = undefined;
</script>

<div class="bg-surface border border-border-muted rounded-lg p-4">
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3">
      <ProviderIcon provider={target.type} />
      <div>
        <h3 class="font-medium text-text-primary">{target.name}</h3>
        <span class="text-xs text-text-secondary capitalize">{target.type}</span>
      </div>
    </div>
    <StatusBadge status={target.status} />
  </div>
  <div class="grid grid-cols-2 gap-2 text-xs mb-3">
    <div>
      <span class="text-text-secondary">Snapshots</span>
      <div class="font-mono text-text-primary">{target.snapshot_count}</div>
    </div>
    <div>
      <span class="text-text-secondary">Size</span>
      <div class="font-mono text-text-primary">{formatBytes(target.total_size_bytes)}</div>
    </div>
  </div>
  <div class="flex gap-2">
    {#if onTest}
      <button on:click={() => onTest?.(target.id)} class="text-xs px-2 py-1 rounded border border-border-muted text-text-secondary hover:text-text-primary hover:border-primary transition-colors">Test</button>
    {/if}
    {#if onEdit}
      <button on:click={() => onEdit?.(target.id)} class="text-xs px-2 py-1 rounded border border-border-muted text-text-secondary hover:text-text-primary hover:border-primary transition-colors">Edit</button>
    {/if}
    {#if onDelete}
      <button on:click={() => onDelete?.(target.id)} class="text-xs px-2 py-1 rounded border border-border-muted text-error hover:bg-error/10 transition-colors">Remove</button>
    {/if}
  </div>
</div>
