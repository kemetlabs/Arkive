<script lang="ts">
  export let status: 'ok' | 'warning' | 'error' | 'offline' = 'ok';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let label: string = '';

  const colorMap: Record<string, string> = {
    ok: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    offline: 'bg-text-muted',
  };

  const ringMap: Record<string, string> = {
    ok: 'ring-success/30',
    warning: 'ring-warning/30',
    error: 'ring-error/30',
    offline: 'ring-text-muted/30',
  };

  const sizeMap: Record<string, string> = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  $: animate = status === 'ok' || status === 'warning';
</script>

<span class="inline-flex items-center gap-2">
  <span class="relative inline-flex">
    <span
      class="rounded-full {colorMap[status]} {sizeMap[size]}"
      class:animate-pulse={animate}
    ></span>
    {#if animate}
      <span
        class="absolute inset-0 rounded-full ring-2 {ringMap[status]} animate-ping opacity-40"
        style="animation-duration: 2s;"
      ></span>
    {/if}
  </span>
  {#if label}
    <span class="text-xs text-text-secondary">{label}</span>
  {/if}
</span>
