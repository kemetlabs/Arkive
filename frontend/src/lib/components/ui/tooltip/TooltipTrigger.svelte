<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<TooltipPrimitive.Trigger class={cn(className)} {...$$restProps}>
  <slot />
</TooltipPrimitive.Trigger>
