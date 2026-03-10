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
  import { Button } from '$lib/components/ui/button';

  export let open: boolean = false;
  export let jobs: Array<{ id: string; name: string; enabled?: boolean }> = [];

  const dispatch = createEventDispatcher();

  let selectedJobId: string = '';
  let running: boolean = false;
  let result: { status: string; message: string } | null = null;
  let error: string | null = null;

  $: enabledJobs = jobs.filter((j) => j.enabled !== false);
  $: if (enabledJobs.length === 1 && !selectedJobId) {
    selectedJobId = enabledJobs[0].id;
  }

  $: if (!open) {
    resetState();
  }

  function resetState() {
    selectedJobId = enabledJobs.length === 1 ? enabledJobs[0]?.id ?? '' : '';
    running = false;
    result = null;
    error = null;
  }

  function handleTrigger() {
    if (!selectedJobId) return;
    running = true;
    error = null;
    dispatch('trigger', { jobId: selectedJobId });
  }

  function handleClose() {
    open = false;
  }

  /** Called by parent after trigger completes */
  export function setResult(res: { status: string; message: string }) {
    running = false;
    result = res;
  }

  /** Called by parent on trigger error */
  export function setError(msg: string) {
    running = false;
    error = msg;
  }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>Backup Now</DialogTitle>
      <DialogDescription>
        Trigger a manual backup immediately. Select a job below.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-4">
      <div aria-live="polite" aria-atomic="true">
        {#if result}
          <div class="flex items-center gap-3 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{result.message || 'Backup triggered successfully.'}</span>
          </div>
        {:else if error}
          <div class="flex items-center gap-3 rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        {/if}
      </div>
      {#if result}
        <DialogFooter>
          <Button variant="outline" on:click={handleClose}>Done</Button>
        </DialogFooter>
      {:else if error}
        <DialogFooter>
          <Button variant="outline" on:click={handleClose}>Cancel</Button>
          <Button on:click={handleTrigger}>Retry</Button>
        </DialogFooter>
      {:else}
        {#if enabledJobs.length === 0}
          <p class="text-sm text-text-secondary">
            No enabled backup jobs found. Create and enable a backup job first.
          </p>
          <DialogFooter>
            <Button variant="outline" on:click={handleClose}>Close</Button>
          </DialogFooter>
        {:else}
          <div class="space-y-2">
            <label class="text-sm font-medium text-text-primary" for="job-select">Select Job</label>
            <div class="space-y-1">
              {#each enabledJobs as job (job.id)}
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors
                    {selectedJobId === job.id
                      ? 'border-primary bg-primary/10 text-text-primary'
                      : 'border-border bg-bg-input text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'}"
                  on:click={() => (selectedJobId = job.id)}
                >
                  <span class="flex h-4 w-4 items-center justify-center rounded-full border
                    {selectedJobId === job.id ? 'border-primary' : 'border-border'}">
                    {#if selectedJobId === job.id}
                      <span class="h-2 w-2 rounded-full bg-primary"></span>
                    {/if}
                  </span>
                  {job.name}
                </button>
              {/each}
            </div>
          </div>

          <p class="text-xs text-text-muted">
            The backup will run in the background. You can monitor progress from the dashboard.
          </p>

          <DialogFooter>
            <Button variant="outline" on:click={handleClose}>Cancel</Button>
            <Button on:click={handleTrigger} disabled={running || !selectedJobId}>
              {#if running}
                <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Starting...
              {:else}
                Start Backup
              {/if}
            </Button>
          </DialogFooter>
        {/if}
      {/if}
    </div>
  </DialogContent>
</Dialog>
