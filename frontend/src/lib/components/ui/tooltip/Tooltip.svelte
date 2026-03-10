<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui';

  export let openDelay: number = 200;
</script>

<TooltipPrimitive.Root delayDuration={openDelay}>
  <slot />
</TooltipPrimitive.Root>
