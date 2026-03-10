<script lang="ts">
  export let columns: Array<{ key: string; label: string; class?: string }> = [];
  export let rows: Array<Record<string, unknown>> = [];
  export let onRowClick: ((row: Record<string, unknown>) => void) | undefined = undefined;
  export let loading: boolean = false;
</script>

<div class="border border-border-muted rounded-lg overflow-hidden">
  <table class="w-full text-sm">
    <thead>
      <tr class="bg-surface border-b border-border-muted">
        {#each columns as col}
          <th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider {col.class || ''}">
            {col.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if loading}
        {#each Array(5) as _}
          <tr class="border-b border-border-muted">
            {#each columns as _}
              <td class="px-4 py-3">
                <div class="h-4 bg-border-muted rounded animate-skeleton"></div>
              </td>
            {/each}
          </tr>
        {/each}
      {:else}
        {#each rows as row}
          <tr
            class="border-b border-border-muted hover:bg-hover transition-colors"
            class:cursor-pointer={!!onRowClick}
            on:click={() => onRowClick?.(row)}
          >
            {#each columns as col}
              <td class="px-4 py-3 text-text-primary {col.class || ''}">
                <slot name="cell" {row} column={col.key}>
                  {row[col.key] ?? '—'}
                </slot>
              </td>
            {/each}
          </tr>
        {:else}
          <tr>
            <td colspan={columns.length} class="px-4 py-8 text-center text-text-secondary">
              No data
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
