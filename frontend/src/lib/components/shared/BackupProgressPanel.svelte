<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
  import { backupApi } from '$lib/api/backup';
  import { subscribe } from '$lib/stores/sse';
  import { backupRunning } from '$lib/stores/app';
  import { BACKUP_PHASES, phaseToIndex } from '$lib/constants/backup-phases';

  const STORAGE_KEY = 'arkive_backup_progress';

  type BackupPanelStatus = 'running' | 'success' | 'failed' | 'idle';
  interface PersistedProgressState {
    runId: string | null;
    visible: boolean;
    currentPhaseIndex: number;
    percent: number;
    status: BackupPanelStatus;
    errorMessage: string;
    updatedAt: string;
  }

  let visible = false;
  let currentPhaseIndex = 0;
  let percent = 0;
  let status: BackupPanelStatus = 'idle';
  let errorMessage = '';
  let runId: string | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const phaseLabels = BACKUP_PHASES.map(p => p.label);

  function clearHideTimer() {
    if (hideTimer !== null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function persistState() {
    if (typeof sessionStorage === 'undefined') return;
    if (status === 'idle' || (!visible && status !== 'running')) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    const snapshot: PersistedProgressState = {
      runId,
      visible,
      currentPhaseIndex,
      percent,
      status,
      errorMessage,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  function clearPersistedState() {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function restorePersistedState(): PersistedProgressState | null {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedProgressState;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  function applyState(snapshot: PersistedProgressState) {
    runId = snapshot.runId;
    visible = snapshot.visible;
    currentPhaseIndex = snapshot.currentPhaseIndex;
    percent = snapshot.percent;
    status = snapshot.status;
    errorMessage = snapshot.errorMessage;
  }

  async function hydrateRunningState() {
    const persisted = restorePersistedState();
    if (persisted) {
      applyState(persisted);
    }

    try {
      const response = await backupApi.listRuns({ status: 'running', limit: 1 });
      const activeRun = response.items?.[0] ?? null;
      if (activeRun) {
        backupRunning.set(true);
        clearHideTimer();
        visible = true;
        status = 'running';
        if (persisted?.runId === activeRun.id) {
          runId = persisted.runId;
        } else {
          runId = activeRun.id;
          currentPhaseIndex = 0;
          percent = 0;
          errorMessage = '';
        }
        persistState();
        return;
      }
    } catch {
      // Ignore bootstrap failures and wait for SSE updates.
    }

    backupRunning.set(false);
    if (status === 'running') {
      visible = false;
      status = 'idle';
      runId = null;
      currentPhaseIndex = 0;
      percent = 0;
      errorMessage = '';
      clearPersistedState();
    }
  }

  const unsubStarted = subscribe('backup:started', (event) => {
    const data = event.data as { run_id?: string };
    clearHideTimer();
    visible = true;
    status = 'running';
    runId = data.run_id ?? null;
    currentPhaseIndex = 0;
    percent = 0;
    errorMessage = '';
    backupRunning.set(true);
    persistState();
  });

  const unsubProgress = subscribe('backup:progress', (event) => {
    const data = event.data as { run_id?: string; phase?: string; percent?: number };
    runId = data.run_id ?? runId;
    if (data.phase) {
      currentPhaseIndex = phaseToIndex(data.phase);
    }
    if (typeof data.percent === 'number') {
      percent = data.percent;
    }
    status = 'running';
    visible = true;
    backupRunning.set(true);
    persistState();
  });

  const unsubCompleted = subscribe('backup:completed', (event) => {
    const data = event.data as { run_id?: string };
    runId = data.run_id ?? runId;
    status = 'success';
    currentPhaseIndex = BACKUP_PHASES.length;
    percent = 100;
    backupRunning.set(false);
    persistState();
    clearHideTimer();
    hideTimer = setTimeout(() => {
      visible = false;
      status = 'idle';
      runId = null;
      clearPersistedState();
    }, 10000);
  });

  const unsubFailed = subscribe('backup:failed', (event) => {
    const data = event.data as { run_id?: string; error?: string; message?: string };
    runId = data.run_id ?? runId;
    status = 'failed';
    errorMessage = data.error || data.message || 'Backup failed';
    visible = true;
    backupRunning.set(false);
    clearHideTimer();
    persistState();
  });

  const unsubCancelled = subscribe('backup:cancelled', (event) => {
    const data = event.data as { run_id?: string; message?: string };
    runId = data.run_id ?? runId;
    status = 'failed';
    errorMessage = data.message || 'Backup cancelled';
    visible = true;
    backupRunning.set(false);
    clearHideTimer();
    persistState();
  });

  onMount(() => {
    hydrateRunningState();
  });

  onDestroy(() => {
    unsubStarted();
    unsubProgress();
    unsubCompleted();
    unsubFailed();
    unsubCancelled();
    clearHideTimer();
  });
</script>

{#if visible || $backupRunning}
  <div class="bg-bg-surface border border-border rounded-lg p-5 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-text text-sm">Backup Progress</h3>
      {#if status === 'running'}
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          Running
        </span>
      {:else if status === 'success'}
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/20 text-success">
          Complete
        </span>
      {:else if status === 'failed'}
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger/20 text-danger">
          Failed
        </span>
      {/if}
    </div>

    <!-- Horizontal phase rail -->
    <div class="flex items-center">
      {#each phaseLabels as phase, i}
        <div class="flex items-center" style="flex: {i < phaseLabels.length - 1 ? '1' : '0 0 auto'}">
          <!-- Node -->
          <div class="flex flex-col items-center gap-1 shrink-0">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300
                {i < currentPhaseIndex
                  ? 'bg-success text-white'
                  : i === currentPhaseIndex && status === 'running'
                    ? 'bg-info text-white animate-pulse'
                  : i === currentPhaseIndex && status === 'failed'
                    ? 'bg-danger text-white'
                  : i === currentPhaseIndex && status === 'success'
                    ? 'bg-success text-white'
                  : 'border-2 border-border-muted bg-transparent text-text-tertiary'}"
            >
              {#if i < currentPhaseIndex || status === 'success'}
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                {i + 1}
              {/if}
            </div>
            <span class="text-[10px] text-text-tertiary whitespace-nowrap leading-tight max-w-[52px] text-center">{phase}</span>
          </div>
          <!-- Connector line (not after last node) -->
          {#if i < phaseLabels.length - 1}
            <div
              class="flex-1 h-0.5 mx-1 mb-4 transition-colors duration-300
                {i < currentPhaseIndex ? 'bg-success' : 'bg-border-muted'}"
            ></div>
          {/if}
        </div>
      {/each}
    </div>

    <ProgressBar
      value={percent}
      max={100}
      size="sm"
      variant={status === 'failed' ? 'danger' : status === 'success' ? 'success' : 'primary'}
      active={status === 'running'}
    />

    {#if status === 'failed' && errorMessage}
      <p class="text-xs text-danger">{errorMessage}</p>
    {/if}

    {#if status === 'success'}
      <p class="text-xs text-text-secondary">Backup completed successfully. This panel will close in 10 seconds.</p>
    {/if}
  </div>
{/if}
