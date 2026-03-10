<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/settings/general', label: 'General', icon: '⚙️' },
    { href: '/settings/targets', label: 'Storage Targets', icon: '☁️' },
    { href: '/settings/schedule', label: 'Schedule', icon: '🕐' },
    { href: '/settings/jobs', label: 'Backup Jobs', icon: '📋' },
    { href: '/settings/directories', label: 'Directories', icon: '📁' },
    { href: '/settings/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/settings/security', label: 'Security', icon: '🔐' },
  ];

  function linkClass(href: string, currentPath: string): string {
    return currentPath === href
      ? 'bg-primary/10 text-primary'
      : 'text-text-secondary hover:text-text hover:bg-surface-hover';
  }
</script>

<div class="flex h-full">
  <nav class="w-56 border-r border-border p-4 space-y-1">
    <h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 px-2">Settings</h2>
    {#each links as link}
      <a
        href={link.href}
        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors {linkClass(link.href, $page.url.pathname)}"
      >
        <span>{link.icon}</span>
        {link.label}
      </a>
    {/each}
  </nav>
  <div class="flex-1 overflow-y-auto">
    <slot />
  </div>
</div>
