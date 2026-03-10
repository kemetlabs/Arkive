<script lang="ts">
  import { formatBytes } from '$lib/utils/format';
  import type { FileNode } from '$lib/types';

  export let node: FileNode;
  export let depth: number = 0;
  export let selectedPaths: string[] = [];
  export let onSelect: ((path: string) => void) | undefined = undefined;
  export let onExpand: ((path: string) => void) | undefined = undefined;

  let expanded = false;
  $: selected = selectedPaths.includes(node.path);

  function toggle() {
    if (node.type === 'dir') {
      expanded = !expanded;
      if (expanded && onExpand) onExpand(node.path);
    }
  }

  function handleSelect() {
    if (onSelect) onSelect(node.path);
  }
</script>

<div>
  <div
    class="flex items-center gap-1 py-1 px-2 hover:bg-hover rounded cursor-pointer"
    style="padding-left: {depth * 16 + 8}px"
    on:click={toggle}
    on:keydown={(e) => e.key === 'Enter' && toggle()}
    role="treeitem"
    aria-selected={selected}
    tabindex="0"
  >
    {#if onSelect}
      <input type="checkbox" checked={selected} on:click|stopPropagation={handleSelect} class="rounded" />
    {/if}
    <span class="text-text-secondary">
      {#if node.type === 'dir'}
        {expanded ? '📂' : '📁'}
      {:else}
        📄
      {/if}
    </span>
    <span class="text-text-primary flex-1">{node.name}</span>
    {#if node.size !== undefined && node.type === 'file'}
      <span class="text-text-secondary text-xs">{formatBytes(node.size)}</span>
    {/if}
  </div>
  {#if expanded && node.children}
    {#each node.children as child}
      <svelte:self node={child} depth={depth + 1} {selectedPaths} {onSelect} {onExpand} />
    {/each}
  {/if}
</div>
