<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CronEditor from '../shared/CronEditor.svelte';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '$lib/components/ui/dialog';
  import { backupJobSchema } from '$lib/schemas/backup-job';

  export let open: boolean = false;
  export let loading: boolean = false;
  export let targets: Array<{ id: string; name: string }> = [];

  const dispatch = createEventDispatcher();

  let name = '';
  let schedule = '0 7 * * *';
  let selectedTargets: string[] = [];
  let includeDatabases = true;
  let includeFlash = true;
  let errors: Record<string, string> = {};

  function toggleTarget(id: string) {
    if (selectedTargets.includes(id)) selectedTargets = selectedTargets.filter(t => t !== id);
    else selectedTargets = [...selectedTargets, id];
  }

  function submit() {
    const result = backupJobSchema.safeParse({
      name,
      schedule,
      targets: selectedTargets,
      include_databases: includeDatabases,
      include_flash: includeFlash,
      directories: [],
      exclude_patterns: [],
    });
    if (!result.success) {
      errors = Object.fromEntries(result.error.issues.map(e => [e.path.map(String).join('.') || '_root', e.message]));
      return;
    }
    errors = {};
    dispatch('submit', {
      name,
      schedule,
      targets: selectedTargets,
      include_databases: includeDatabases,
      include_flash: includeFlash,
    });
  }

  function cancel() { dispatch('cancel'); open = false; }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-lg">
    <DialogHeader>
      <DialogTitle>Create Backup Job</DialogTitle>
      <DialogDescription>Configure a new scheduled backup job.</DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-2">
      <div>
        <label for="job-name" class="text-sm font-medium text-text-primary block mb-1">Job Name</label>
        <input id="job-name" bind:value={name} class="w-full bg-page border border-border-muted rounded-md px-3 py-2 text-sm text-text-primary" placeholder="Daily Cloud Backup" />
        {#if errors.name}<p class="text-xs text-danger mt-1">{errors.name}</p>{/if}
      </div>
      <CronEditor bind:value={schedule} label="Schedule" />
      {#if errors.schedule}<p class="text-xs text-danger mt-1">{errors.schedule}</p>{/if}
      <div>
        <span id="targets-label" class="text-sm font-medium text-text-primary block mb-2">Targets</span>
        <div class="space-y-1" role="group" aria-labelledby="targets-label">
          {#each targets as target}
            <label class="flex items-center gap-2 text-sm text-text-primary p-2 rounded hover:bg-hover">
              <input type="checkbox" checked={selectedTargets.includes(target.id)} on:change={() => toggleTarget(target.id)} class="rounded" />
              {target.name}
            </label>
          {:else}
            <p class="text-xs text-text-secondary">No targets configured yet</p>
          {/each}
        </div>
        {#if errors.targets}<p class="text-xs text-danger mt-1">{errors.targets}</p>{/if}
      </div>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" bind:checked={includeDatabases} class="rounded" />
          Include databases
        </label>
        <label class="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" bind:checked={includeFlash} class="rounded" />
          Include flash backup
        </label>
      </div>
    </div>

    <DialogFooter>
      <button on:click={cancel} class="px-4 py-2 text-sm rounded-md border border-border-muted text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
      <button on:click={submit} disabled={loading} class="px-4 py-2 text-sm rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        {#if loading}<span class="animate-spin mr-1">⟳</span>{/if}
        Create Job
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
