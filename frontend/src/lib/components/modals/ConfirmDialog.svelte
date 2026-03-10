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
  export let title: string = 'Confirm';
  export let message: string = 'Are you sure?';
  export let confirmLabel: string = 'Confirm';
  export let cancelLabel: string = 'Cancel';
  export let destructive: boolean = false;
  export let loading: boolean = false;

  const dispatch = createEventDispatcher();

  function confirm() { dispatch('confirm'); }
  function cancel() { dispatch('cancel'); open = false; }

  $: btnClass = destructive
    ? 'bg-danger hover:bg-danger/90'
    : 'bg-primary hover:bg-primary/90';
</script>

<Dialog bind:open>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{message}</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <button on:click={cancel} class="px-4 py-2 text-sm rounded-md border border-border text-text-secondary hover:text-text transition-colors">
        {cancelLabel}
      </button>
      <button
        on:click={confirm}
        disabled={loading}
        class="px-4 py-2 text-sm rounded-md font-medium text-white transition-colors disabled:opacity-50 {btnClass}"
      >
        {#if loading}
          <span class="animate-spin mr-1">⟳</span>
        {/if}
        {confirmLabel}
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
