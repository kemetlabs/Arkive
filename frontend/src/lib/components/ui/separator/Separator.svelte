<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let decorative: boolean = true;

  let className: string | undefined = undefined;
  export { className as class };
</script>

<div
  role={decorative ? 'none' : 'separator'}
  aria-orientation={decorative ? undefined : orientation}
  class={cn(
    'shrink-0 bg-border',
    orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
    className
  )}
  {...$$restProps}
></div>
