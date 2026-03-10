<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<TabsPrimitive.List
  class={cn(
    'inline-flex h-9 items-center justify-center rounded-lg bg-bg-surface p-1 text-text-secondary',
    className
  )}
  {...$$restProps}
>
  <slot />
</TabsPrimitive.List>
