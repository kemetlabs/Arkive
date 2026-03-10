<script lang="ts">
  export let icon: string = 'box';
  export let title: string = 'Nothing here yet';

  // Used by parent; suppress unused warning
  $: void icon;
  export let description: string = '';
  export let actionLabel: string = '';
  export let onAction: (() => void) | undefined = undefined;
</script>

<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="text-4xl mb-4 text-text-secondary">
    <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  </div>
  <h3 class="text-lg font-medium text-text mb-1">{title}</h3>
  {#if description}
    <p class="text-sm text-text-secondary max-w-md">{description}</p>
  {/if}
  {#if actionLabel && onAction}
    <button
      on:click={onAction}
      class="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
    >
      {actionLabel}
    </button>
  {/if}
</div>
