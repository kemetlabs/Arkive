<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '$lib/components/ui/dialog';

  export let open: boolean = false;
  export let loading: boolean = false;

  const dispatch = createEventDispatcher();

  let name = '';
  let type = 'slack';
  let url = '';
  let events: string[] = ['backup.success', 'backup.failed'];

  const types = [
    { value: 'slack', label: 'Slack' },
    { value: 'discord', label: 'Discord' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'email', label: 'Email' },
    { value: 'ntfy', label: 'ntfy' },
    { value: 'gotify', label: 'Gotify' },
    { value: 'pushover', label: 'Pushover' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'uptimekuma', label: 'Uptime Kuma' },
  ];

  const allEvents = [
    'backup.success', 'backup.failed', 'backup.partial',
    'discovery.completed', 'target.error',
    'system.startup', 'system.shutdown',
  ];

  function toggleEvent(e: string) {
    if (events.includes(e)) events = events.filter(x => x !== e);
    else events = [...events, e];
  }

  function eventBtnClass(event: string): string {
    return events.includes(event)
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-border text-text-secondary';
  }

  function submit() {
    dispatch('submit', { name, type, url, events, enabled: true });
  }

  function cancel() { dispatch('cancel'); open = false; }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-lg">
    <DialogHeader>
      <DialogTitle>Add Notification Channel</DialogTitle>
      <DialogDescription>Configure a new notification destination for backup events.</DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-2">
      <div>
        <label for="notif-name" class="text-sm font-medium text-text block mb-1">Name</label>
        <input id="notif-name" bind:value={name} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text" placeholder="My Slack Channel" />
      </div>
      <div>
        <label for="notif-type" class="text-sm font-medium text-text block mb-1">Type</label>
        <select id="notif-type" bind:value={type} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text">
          {#each types as t}
            <option value={t.value}>{t.label}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="notif-url" class="text-sm font-medium text-text block mb-1">URL / Webhook</label>
        <input id="notif-url" bind:value={url} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" placeholder="https://hooks.slack.com/..." />
      </div>
      <div>
        <span id="notif-events-label" class="text-sm font-medium text-text block mb-2">Events</span>
        <div class="flex flex-wrap gap-2" role="group" aria-labelledby="notif-events-label">
          {#each allEvents as event}
            <button
              on:click={() => toggleEvent(event)}
              class="text-xs px-2 py-1 rounded border transition-colors {eventBtnClass(event)}"
            >
              {event}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <DialogFooter>
      <button on:click={cancel} class="px-4 py-2 text-sm rounded-md border border-border text-text-secondary hover:text-text transition-colors">Cancel</button>
      <button on:click={submit} disabled={loading || !name || !url} class="px-4 py-2 text-sm rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        {#if loading}<span class="animate-spin mr-1">⟳</span>{/if}
        Add Channel
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
