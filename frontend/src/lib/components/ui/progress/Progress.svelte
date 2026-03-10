<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let value: number = 0;
  export let max: number = 100;

  let className: string | undefined = undefined;
  export { className as class };

  $: percentage = Math.min(Math.max((value / max) * 100, 0), 100);
</script>

<div
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  class={cn(
    'relative h-2 w-full overflow-hidden rounded-full bg-bg-elevated',
    className
  )}
  {...$$restProps}
>
  <div
    class="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
    style="width: {percentage}%"
  ></div>
</div>
