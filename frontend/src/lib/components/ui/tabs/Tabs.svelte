<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';

  export let value: string = '';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<TabsPrimitive.Root bind:value class={cn(className)} {...$$restProps}>
  <slot />
</TabsPrimitive.Root>
