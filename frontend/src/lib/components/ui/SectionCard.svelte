<script lang="ts">
  export let title: string = '';
  export let description: string = '';
  export let variant: 'default' | 'danger' = 'default';
  let className: string = '';
  export { className as class };
</script>

<div
  class="bg-bg-surface rounded-lg p-6 {className}
         {variant === 'danger' ? 'border border-dashed border-danger/40' : 'border border-border'}"
>
  {#if title}
    <div class="mb-5">
      <h3 class="text-base font-semibold text-text">{title}</h3>
      {#if description}
        <p class="text-sm text-text-secondary mt-1">{description}</p>
      {/if}
      <div class="border-b border-border-muted mt-4"></div>
    </div>
  {/if}
  <div class="space-y-5">
    <slot />
  </div>
</div>
