<script lang="ts">
  import type { ActivityEntry } from '$lib/types';
  import TimelineEntry from './TimelineEntry.svelte';

  export let entries: ActivityEntry[] = [];
</script>

<div class="relative">
  <!-- Vertical connector line -->
  <div class="absolute left-[7px] top-2 bottom-2 w-px bg-border-muted" aria-hidden="true"></div>

  <div class="space-y-1">
    {#each entries as entry (entry.id)}
      <TimelineEntry {entry} />
    {:else}
      <p class="text-sm text-text-secondary py-8 text-center pl-6">No activity yet</p>
    {/each}
  </div>
</div>
