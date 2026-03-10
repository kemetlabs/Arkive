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
  import { AlertTriangle } from 'lucide-svelte';

  export let open: boolean = false;
  export let title: string = 'Confirm Action';
  export let message: string = 'Are you sure you want to proceed? This action cannot be undone.';
  export let confirmLabel: string = 'Delete';

  const dispatch = createEventDispatcher<{ confirm: void; cancel: void }>();

  let loading: boolean = false;

  $: if (!open) {
    loading = false;
  }

  function handleConfirm() {
    loading = true;
    dispatch('confirm');
  }

  function handleCancel() {
    open = false;
    dispatch('cancel');
  }

  /** Called by parent to clear loading state after async action completes */
  export function setDone() {
    loading = false;
  }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>
        <span class="flex items-center gap-2">
          <AlertTriangle size={20} class="text-error" />
          {title}
        </span>
      </DialogTitle>
      <DialogDescription>
        {message}
      </DialogDescription>
    </DialogHeader>

    <div class="py-2">
      <div class="rounded-md border border-error/20 bg-error/5 px-3 py-2.5">
        <p class="text-xs text-error/80">
          This is a destructive action and cannot be undone. Please make sure you want to proceed.
        </p>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" on:click={handleCancel}>Cancel</Button>
      <Button
        variant="destructive"
        on:click={handleConfirm}
        disabled={loading}
      >
        {#if loading}
          <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Processing...
        {:else}
          {confirmLabel}
        {/if}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
