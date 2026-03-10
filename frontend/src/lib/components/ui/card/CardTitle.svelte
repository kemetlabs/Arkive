<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };

  export let tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' = 'h3';
</script>

<svelte:element
  this={tag}
  class={cn('text-lg font-semibold leading-none tracking-tight text-text-primary', className)}
  {...$$restProps}
>
  <slot />
</svelte:element>
