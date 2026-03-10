<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type Variant = 'default' | 'destructive' | 'success' | 'warning';

  export let variant: Variant = 'default';

  let className: string | undefined = undefined;
  export { className as class };

  const variantClasses: Record<Variant, string> = {
    default: 'border-border bg-bg-surface text-text-primary',
    destructive: 'border-error/50 bg-error-bg text-error',
    success: 'border-success/50 bg-success-bg text-success',
    warning: 'border-warning/50 bg-warning-bg text-warning',
  };
</script>

<div
  role="alert"
  class={cn(
    'relative w-full rounded-lg border p-4',
    '[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current',
    '[&>svg~*]:pl-7',
    variantClasses[variant],
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
