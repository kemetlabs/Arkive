<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils/cn';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<DialogPrimitive.Title
  class={cn('text-lg font-semibold leading-none tracking-tight text-text-primary', className)}
  {...$$restProps}
>
  <slot />
</DialogPrimitive.Title>
