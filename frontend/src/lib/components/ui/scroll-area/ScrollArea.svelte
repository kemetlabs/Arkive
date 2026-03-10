<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let orientation: 'vertical' | 'horizontal' | 'both' = 'vertical';

  let className: string | undefined = undefined;
  export { className as class };

  $: overflowClass = (() => {
    switch (orientation) {
      case 'horizontal': return 'overflow-x-auto overflow-y-hidden';
      case 'both': return 'overflow-auto';
      default: return 'overflow-y-auto overflow-x-hidden';
    }
  })();
</script>

<div
  class={cn(
    'relative',
    overflowClass,
    '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-bg-elevated hover:[&::-webkit-scrollbar-thumb]:bg-text-muted',
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
