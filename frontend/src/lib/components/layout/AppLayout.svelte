  <script lang="ts">
  import AppSidebar from './AppSidebar.svelte';
  import AppHeader from './AppHeader.svelte';
  import { status as healthStatus, refreshStatus } from '$lib/stores/health';
  import { sse } from '$lib/stores/sse';
  import { onMount } from 'svelte';

  let sidebarOpen = false;
  let sidebarCollapsed = false;

  onMount(() => {
    refreshStatus();
    sse.connect('/api/events/stream');
    return () => sse.disconnect();
  });
</script>

<div class="flex h-screen bg-bg-app text-text-primary">
  <!-- Sidebar -->
  <AppSidebar
    bind:open={sidebarOpen}
    bind:collapsed={sidebarCollapsed}
    on:close={() => (sidebarOpen = false)}
  />

  <!-- Main content area - offset by sidebar width -->
  <div
    class="flex flex-col flex-1 overflow-hidden transition-all duration-300
           md:ml-14 lg:ml-[220px]"
    class:md:ml-[220px]={!sidebarCollapsed}
  >
    <AppHeader
      serverName="Arkive"
      status={(($healthStatus as any)?.status ?? 'loading') as string}
      onMenuClick={() => (sidebarOpen = !sidebarOpen)}
    />
    <main class="flex-1 overflow-y-auto p-6">
      <slot />
    </main>
  </div>
</div>
