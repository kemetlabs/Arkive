<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<div
  class={cn(
    'animate-pulse rounded-md bg-bg-elevated',
    className
  )}
  {...$$restProps}
></div>
