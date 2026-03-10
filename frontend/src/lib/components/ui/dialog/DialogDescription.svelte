<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<DialogPrimitive.Description
  class={cn('text-sm text-text-secondary', className)}
  {...$$restProps}
>
  <slot />
</DialogPrimitive.Description>
