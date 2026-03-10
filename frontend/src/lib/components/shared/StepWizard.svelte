<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Check } from 'lucide-svelte';

  export let steps: Array<{ label: string; description?: string }> = [];
  export let currentStep: number = 0;
  export let allowNavigation: boolean = false;

  let className: string = '';
  export { className as class };

  const dispatch = createEventDispatcher<{
    step: number;
    next: number;
    back: number;
    complete: void;
  }>();

  function getStepStatus(index: number): 'completed' | 'active' | 'pending' {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  }

  function goToStep(index: number) {
    if (!allowNavigation && index > currentStep) return;
    currentStep = index;
    dispatch('step', currentStep);
  }

  function next() {
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      dispatch('next', currentStep);
      dispatch('step', currentStep);
    } else {
      dispatch('complete');
    }
  }

  function back() {
    if (currentStep > 0) {
      currentStep -= 1;
      dispatch('back', currentStep);
      dispatch('step', currentStep);
    }
  }

  $: progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  $: isFirst = currentStep === 0;
  $: isLast = currentStep === steps.length - 1;
</script>

<div class={cn('space-y-6', className)}>
  <!-- Step indicators -->
  <div class="relative">
    <!-- Progress track background -->
    <div class="absolute top-4 left-0 right-0 h-0.5 bg-bg-elevated">
      <div
        class="h-full bg-primary transition-all duration-300"
        style="width: {progress}%"
      ></div>
    </div>

    <!-- Step circles with labels -->
    <div class="relative flex justify-between">
      {#each steps as step, i}
        {@const status = getStepStatus(i)}
        <button
          type="button"
          class="flex flex-col items-center gap-2 group"
          disabled={!allowNavigation && i > currentStep}
          on:click={() => goToStep(i)}
        >
          <!-- Numbered circle -->
          <div
            class={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 z-10',
              status === 'completed' && 'bg-success text-text-on-primary',
              status === 'active' && 'bg-primary text-text-on-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-bg-app',
              status === 'pending' && 'bg-bg-elevated text-text-muted border border-border-muted'
            )}
          >
            {#if status === 'completed'}
              <Check size={16} />
            {:else}
              {i + 1}
            {/if}
          </div>

          <!-- Step label and description -->
          <div class="text-center min-w-[80px]">
            <p
              class={cn(
                'text-xs font-medium',
                status === 'completed' && 'text-success',
                status === 'active' && 'text-primary',
                status === 'pending' && 'text-text-muted'
              )}
            >
              {step.label}
            </p>
            {#if step.description}
              <p class="text-[10px] text-text-muted mt-0.5">{step.description}</p>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Step content -->
  <div class="min-h-[200px]">
    <slot step={currentStep} {next} {back} {isFirst} {isLast} />
  </div>

  <!-- Navigation buttons -->
  <div class="flex justify-between pt-4 border-t border-border-muted">
    <button
      type="button"
      on:click={back}
      disabled={isFirst}
      class={cn(
        'px-4 py-2 text-sm font-medium rounded-md border border-border-muted text-text-secondary transition-colors',
        isFirst ? 'opacity-50 cursor-not-allowed' : 'hover:text-text-primary hover:border-border'
      )}
    >
      Back
    </button>
    <div class="flex items-center gap-2">
      <span class="text-xs text-text-muted">
        Step {currentStep + 1} of {steps.length}
      </span>
      <button
        type="button"
        on:click={next}
        class="px-4 py-2 text-sm font-medium rounded-md bg-primary text-text-on-primary hover:bg-primary-hover transition-colors"
      >
        {isLast ? 'Complete' : 'Next'}
      </button>
    </div>
  </div>
</div>
