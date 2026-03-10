<script lang="ts">
  import { Menu, Settings } from 'lucide-svelte';
  import { connected } from '$lib/stores/sse';

  export let serverName: string = '';
  export let status: string = 'loading';
  export let onMenuClick: () => void = () => {};

  $: statusColor = (() => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'bg-success/20 text-success';
      case 'error':
      case 'unhealthy':
        return 'bg-error/20 text-error';
      case 'warning':
      case 'degraded':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-neutral/20 text-neutral';
    }
  })();

  $: statusLabel = (() => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'Healthy';
      case 'error':
      case 'unhealthy':
        return 'Error';
      case 'warning':
      case 'degraded':
        return 'Degraded';
      case 'loading':
        return 'Loading';
      default:
        return status;
    }
  })();
</script>

<header class="h-14 bg-bg-sidebar border-b border-border flex items-center px-4 gap-4 shrink-0">
  <!-- Mobile menu button -->
  <button
    class="lg:hidden p-1.5 rounded-md hover:bg-bg-surface-hover transition-colors"
    on:click={onMenuClick}
    aria-label="Toggle sidebar menu"
  >
    <Menu class="w-5 h-5 text-text-secondary" />
  </button>

  <!-- Server name / branding -->
  <div class="flex-1 flex items-center justify-center lg:justify-start">
    <span class="text-sm font-medium text-text-secondary truncate">
      {serverName || 'Arkive'}
    </span>
  </div>

  <!-- Status badge -->
  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {statusColor}">
    <span class="w-1.5 h-1.5 rounded-full bg-current" class:animate-pulse={status === 'loading'}></span>
    {statusLabel}
  </span>

  <!-- SSE connection indicator -->
  <span
    class="w-2 h-2 rounded-full shrink-0 {$connected ? 'bg-success' : 'bg-error animate-pulse'}"
    title={$connected ? 'Live updates connected' : 'Live updates disconnected'}
  ></span>

  <!-- Settings link -->
  <a
    href="/settings"
    class="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
    aria-label="Settings"
  >
    <Settings class="w-5 h-5" />
  </a>
</header>
