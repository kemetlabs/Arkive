<script lang="ts">
  import type { FileNode } from '$lib/types';

  export let nodes: FileNode[] = [];
  export let selectedPaths: string[] = [];
  export let onSelect: ((path: string) => void) | undefined = undefined;
  export let onExpand: ((path: string) => void) | undefined = undefined;

  // Used by parent; suppress unused warnings
  $: void selectedPaths;
  $: void onExpand;
</script>

<div class="font-mono text-sm">
  {#each nodes as node}
    <div class="flex items-center gap-2 px-2 py-1 hover:bg-surface rounded cursor-pointer"
      on:click={() => onSelect?.(node.path || node.name)}
      on:keydown={(e) => e.key === 'Enter' && onSelect?.(node.path || node.name)}
      role="button"
      tabindex="0">
      <span class="text-text-secondary">{node.type === 'dir' ? '/' : ''}</span>
      <span class="text-text">{node.name}</span>
    </div>
  {:else}
    <div class="text-text-secondary text-center py-4">No files</div>
  {/each}
</div>
