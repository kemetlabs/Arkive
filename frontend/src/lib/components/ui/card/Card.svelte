<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<div
  class={cn(
    'rounded-lg border border-border bg-bg-surface text-text-primary shadow-sm',
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
