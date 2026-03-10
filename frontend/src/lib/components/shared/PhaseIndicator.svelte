<script lang="ts">
  export let phases: string[] = ['Pre-flight', 'DB Dumps', 'Flash', 'Upload', 'Retention', 'Notify'];
  export let currentPhase: number = 0;
  export let status: 'running' | 'success' | 'failed' | 'idle' = 'idle';
</script>

<div class="flex items-center gap-1">
  {#each phases as phase, i}
    <div class="flex items-center gap-1">
      <div
        class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors"
        class:bg-success={i < currentPhase}
        class:text-white={i < currentPhase || i === currentPhase}
        class:bg-primary={i === currentPhase && status === 'running'}
        class:animate-pulse={i === currentPhase && status === 'running'}
        class:bg-error={i === currentPhase && status === 'failed'}
        class:bg-border-muted={i > currentPhase}
        class:text-text-secondary={i > currentPhase}
      >
        {#if i < currentPhase}
          ✓
        {:else}
          {i + 1}
        {/if}
      </div>
      {#if i < phases.length - 1}
        <div
          class="w-4 h-0.5 transition-colors"
          class:bg-success={i < currentPhase}
          class:bg-border-muted={i >= currentPhase}
        ></div>
      {/if}
    </div>
  {/each}
</div>
<div class="text-xs text-text-secondary mt-1">
  {phases[currentPhase] || 'Complete'}
</div>
