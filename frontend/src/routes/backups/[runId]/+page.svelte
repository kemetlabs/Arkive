<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/client';
  import { backupApi } from '$lib/api/backup';
  import { StatusBadge, PhaseIndicator, LogViewer } from '$lib/components/shared';
  import { formatBytes, formatDuration } from '$lib/utils/format';
  import { formatDateTime, timeAgo } from '$lib/utils/date';
  import { sse } from '$lib/stores/sse';
  import type { JobRun, LogEntry } from '$lib/types';

  export let data: { runId: string };

  let run: (JobRun & Record<string, any>) | null = null;
  let loading = true;
  let error = '';
  let logs: LogEntry[] = [];
  let logsLoading = false;

  // Phase mapping
  const phaseNames = ['Pre-flight', 'DB Dumps', 'Flash', 'Upload', 'Retention', 'Notify'];

  // SSE live updates for active runs
  let unsubEvents: (() => void) | undefined;

  $: runStatus = run?.status || 'running';
  $: currentPhaseIndex = run?.current_phase ?? 0;

  $: durationDisplay = (() => {
    if (!run) return '--';
    if (run.duration_seconds != null) return formatDuration(run.duration_seconds);
    if (run.started_at && run.status === 'running') {
      const elapsed = Math.floor((Date.now() - new Date(run.started_at).getTime()) / 1000);
      return formatDuration(elapsed) + ' (running)';
    }
    return '--';
  })();

  async function loadRun() {
    loading = true;
    error = '';
    try {
      run = (await backupApi.getRun(data.runId)) as any;
    } catch (err: any) {
      error = err.message || 'Failed to load backup run';
    }
    loading = false;
  }

  async function loadLogs() {
    logsLoading = true;
    try {
      const res = await api.get<{ items: LogEntry[] }>(`/jobs/runs/${data.runId}/logs`);
      logs = res.items || [];
    } catch {
      // Logs may not be available for all runs
      logs = [];
    }
    logsLoading = false;
  }

  function goBack() {
    goto('/backups');
  }

  onMount(() => {
    loadRun();
    loadLogs();

    // Subscribe to SSE for live updates on this run
    unsubEvents = sse.events.subscribe((events: Record<string, unknown>) => {
      const progress = events.backupProgress as any;
      if (progress && progress.run_id === data.runId && run) {
        run = { ...run, ...progress };
      }
      const completed = events.backupCompleted as any;
      if (completed && completed.run_id === data.runId) {
        loadRun();
        loadLogs();
      }
    });
  });

  onDestroy(() => {
    unsubEvents?.();
  });
</script>

<svelte:head>
  <title>Backup Run {data.runId?.substring(0, 8)} - Arkive</title>
</svelte:head>

<div class="space-y-6">
  <!-- Breadcrumb & Back -->
  <div class="flex items-center gap-2">
    <button
      on:click={goBack}
      class="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to Backups
    </button>
    <span class="text-text-muted">/</span>
    <span class="text-sm text-text-muted font-mono">{data.runId?.substring(0, 12)}</span>
  </div>

  {#if loading}
    <div class="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary">
      <svg class="w-6 h-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span class="text-sm">Loading run details...</span>
    </div>
  {:else if error}
    <div class="flex flex-col items-center justify-center py-20 gap-3 text-error">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span class="text-sm">{error}</span>
      <button
        on:click={loadRun}
        class="px-4 py-1.5 text-sm bg-bg-elevated border border-border rounded-md text-text-primary hover:bg-bg-surface-hover"
      >
        Retry
      </button>
    </div>
  {:else if run}
    <!-- Run Header -->
    <div class="bg-bg-surface border border-border rounded-lg p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-lg font-semibold text-text-primary">
              {(run as any).job_name || 'Backup Run'}
            </h1>
            <StatusBadge status={run.status} />
          </div>
          <p class="text-sm text-text-muted font-mono">{run.id}</p>
        </div>
        <span class="text-xs px-2 py-0.5 rounded bg-bg-elevated text-text-secondary">
          {run.trigger}
        </span>
      </div>

      <!-- Metadata grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-text-muted mb-1">Started</div>
          <div class="text-sm text-text-primary">
            {run.started_at ? formatDateTime(run.started_at) : '--'}
          </div>
        </div>
        <div>
          <div class="text-xs text-text-muted mb-1">Completed</div>
          <div class="text-sm text-text-primary">
            {run.completed_at ? formatDateTime(run.completed_at) : (run.status === 'running' ? 'In progress' : '--')}
          </div>
        </div>
        <div>
          <div class="text-xs text-text-muted mb-1">Duration</div>
          <div class="text-sm text-text-primary">{durationDisplay}</div>
        </div>
        <div>
          <div class="text-xs text-text-muted mb-1">Total Size</div>
          <div class="text-sm text-text-primary">
            {run.total_size_bytes ? formatBytes(run.total_size_bytes) : '--'}
          </div>
        </div>
      </div>
    </div>

    <!-- Phase Progress -->
    <div class="bg-bg-surface border border-border rounded-lg p-6">
      <h2 class="text-sm font-medium text-text-primary mb-4">Phase Progress</h2>
      <PhaseIndicator
        phases={phaseNames}
        currentPhase={currentPhaseIndex}
        status={runStatus === 'running' ? 'running' : runStatus === 'success' ? 'success' : runStatus === 'failed' ? 'failed' : 'idle'}
      />
    </div>

    <!-- Per-target Results -->
    <div class="bg-bg-surface border border-border rounded-lg p-6">
      <h2 class="text-sm font-medium text-text-primary mb-4">Results</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Databases -->
        <div class="border border-border-muted rounded-md p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
            <span class="text-sm font-medium text-text-primary">Databases</span>
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-text-secondary">Discovered</span>
              <span class="text-text-primary">{run.databases_discovered ?? 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Dumped</span>
              <span class="text-success">{run.databases_dumped ?? 0}</span>
            </div>
            {#if run.databases_failed > 0}
              <div class="flex justify-between">
                <span class="text-text-secondary">Failed</span>
                <span class="text-error font-medium">{run.databases_failed}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Files -->
        <div class="border border-border-muted rounded-md p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span class="text-sm font-medium text-text-primary">Files Backed Up</span>
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-text-secondary">Total Size</span>
              <span class="text-text-primary">{run.total_size_bytes ? formatBytes(run.total_size_bytes) : '--'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Files New</span>
              <span class="text-text-primary">{(run as any).files_new ?? '--'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Files Changed</span>
              <span class="text-text-primary">{(run as any).files_changed ?? '--'}</span>
            </div>
          </div>
        </div>

        <!-- Targets -->
        <div class="border border-border-muted rounded-md p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted"><rect width="20" height="8" x="2" y="14" rx="2"/><rect width="20" height="8" x="2" y="2" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
            <span class="text-sm font-medium text-text-primary">Storage Targets</span>
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-text-secondary">Targets Used</span>
              <span class="text-text-primary">{(run as any).target_count ?? '--'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">Snapshots Created</span>
              <span class="text-text-primary">{(run as any).snapshots_created ?? '--'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error details if failed -->
      {#if run.status === 'failed' && (run as any).error_message}
        <div class="mt-4 p-3 rounded-md border border-error/30 bg-error/5">
          <div class="text-xs font-medium text-error mb-1">Error</div>
          <pre class="text-sm text-error/80 font-mono whitespace-pre-wrap break-all">{(run as any).error_message}</pre>
        </div>
      {/if}
    </div>

    <!-- Log Output -->
    <div class="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-border-muted">
        <h2 class="text-sm font-medium text-text-primary">Run Logs</h2>
      </div>
      <div class="h-80">
        {#if logsLoading}
          <div class="flex items-center justify-center h-full text-text-secondary text-sm">
            Loading logs...
          </div>
        {:else}
          <LogViewer
            entries={logs}
            streaming={run.status === 'running'}
          />
        {/if}
      </div>
    </div>
  {/if}
</div>
