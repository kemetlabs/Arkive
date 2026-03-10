<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<p class={cn('text-sm text-text-secondary', className)} {...$$restProps}>
  <slot />
</p>
