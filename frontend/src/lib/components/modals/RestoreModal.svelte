<script lang="ts">
  import type { Snapshot } from '$lib/types';
  import { api } from '$lib/api/client';
  import { addToast } from '$lib/stores/app';
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
  export let snapshot: Snapshot | null = null;

  let restoreTo = '/tmp/arkive-restore';
  let overwrite = false;
  let dryRun = true;
  let restoreResult: string | null = null;

  function cancel() { open = false; restoreResult = null; }

  async function handleRestore() {
    if (!snapshot) return;
    loading = true;
    restoreResult = null;
    try {
      const result = await api.restore({
        snapshot_id: snapshot.id || snapshot.short_id,
        target_path: restoreTo,
        overwrite,
        dry_run: dryRun
      });
      if (dryRun) {
        restoreResult = `Dry run complete. ${result.files_restored ?? result.files ?? 0} files would be restored.`;
        addToast({ type: 'info', message: 'Dry run completed successfully' });
      } else {
        addToast({ type: 'success', message: `Restore completed: ${result.files_restored ?? result.files ?? 0} files restored` });
        open = false;
      }
    } catch (e: any) {
      addToast({ type: 'error', message: e.message || 'Restore failed' });
      restoreResult = `Error: ${e.message || 'Restore failed'}`;
    } finally {
      loading = false;
    }
  }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-lg bg-surface border-border">
    <DialogHeader>
      <DialogTitle class="text-text">Restore Snapshot</DialogTitle>
      <DialogDescription class="text-text-secondary">
        Configure restore options for snapshot
        {#if snapshot}<span class="font-mono">{snapshot.short_id || snapshot.id?.slice(0, 8)}</span>{/if}.
      </DialogDescription>
    </DialogHeader>

    {#if snapshot}
      <div class="space-y-4 py-2">
        <div class="bg-page rounded-md p-3 border border-border">
          <div class="text-xs text-text-secondary">Snapshot</div>
          <div class="font-mono text-sm text-text">{snapshot.short_id || snapshot.id?.slice(0, 8)}</div>
          <div class="text-xs text-text-secondary mt-1">{snapshot.time}</div>
        </div>
        <div>
          <label for="restore-to" class="text-sm font-medium text-text block mb-1">Restore To</label>
          <input id="restore-to" bind:value={restoreTo} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" />
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" bind:checked={overwrite} class="rounded" />
            Overwrite existing files
          </label>
          <label class="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" bind:checked={dryRun} class="rounded" />
            Dry run (preview only)
          </label>
        </div>
        <div aria-live="polite" aria-atomic="true">
          {#if restoreResult}
            <div class="p-3 rounded-md border text-sm font-mono {restoreResult.startsWith('Error') ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-primary/10 border-primary/30 text-primary'}">
              {restoreResult}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <DialogFooter>
      <button on:click={cancel} class="px-4 py-2 text-sm rounded-md border border-border text-text-secondary hover:text-text transition-colors">Cancel</button>
      <button
        on:click={handleRestore}
        disabled={loading}
        class="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if loading}
          Restoring...
        {:else if dryRun}
          Preview Restore
        {:else}
          Restore Now
        {/if}
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
