<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };

  export let side: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let sideOffset: number = 4;
  export let align: 'start' | 'center' | 'end' = 'center';
</script>

<TooltipPrimitive.Content
  {side}
  {sideOffset}
  {align}
  class={cn(
    'z-tooltip overflow-hidden rounded-md bg-bg-elevated px-3 py-1.5 text-xs text-text-primary shadow-md border border-border',
    className
  )}
  {...$$restProps}
>
  <slot />
</TooltipPrimitive.Content>
