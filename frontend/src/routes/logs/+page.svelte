<svelte:head>
	<title>Logs | Arkive</title>
</svelte:head>

<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import FilterBar from '$lib/components/ui/FilterBar.svelte';
	import { api } from '$lib/api/client';
	import { addToast } from '$lib/stores/app';
	import { onMount } from 'svelte';

	let logs: any[] = [];
	let loading = true;
	let autoScroll = true;
	let error = '';
	let filterSearch = '';
	let filterValues: Record<string, string> = {};

	onMount(() => {
		fetchLogs();
	});

	async function fetchLogs() {
		loading = true;
		error = '';
		try {
			const result = await api.getLogs(500);
			logs = result.items || result.logs || [];
		} catch (e: any) {
			console.error(e);
			error = e.message || 'Failed to load logs';
		}
		loading = false;
	}

	async function clearLogs() {
		try {
			await api.clearLogs();
			logs = [];
			addToast({ type: 'success', message: 'Logs cleared' });
		} catch (e: any) {
			addToast({ type: 'error', message: e.message });
		}
	}

	$: filteredLogs = logs.filter(entry => {
		const level = (entry.level || 'INFO').toUpperCase();
		const levelMatch = !filterValues.level || level === filterValues.level;
		const searchMatch = !filterSearch ||
			(entry.message || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
			level.toLowerCase().includes(filterSearch.toLowerCase());
		return levelMatch && searchMatch;
	});

	const levelBorderClass: Record<string, string> = {
		ERROR: 'border-l-danger',
		CRITICAL: 'border-l-danger',
		WARNING: 'border-l-warning',
		WARN: 'border-l-warning',
	};

	const levelTextClass: Record<string, string> = {
		DEBUG: 'text-text-tertiary',
		INFO: 'text-primary',
		WARNING: 'text-warning',
		WARN: 'text-warning',
		ERROR: 'text-danger',
		CRITICAL: 'text-danger',
	};
</script>

<Header title="Logs" />

<main class="p-6">
	<div class="card">
		<div class="flex items-center justify-between mb-4">
			<h3 class="font-semibold text-text">System Logs</h3>
			<div class="flex items-center gap-3">
				<button on:click={fetchLogs} class="btn-secondary text-sm" aria-label="Refresh logs">Refresh</button>
				<button on:click={clearLogs} class="btn-danger text-sm" aria-label="Clear all logs">Clear</button>
			</div>
		</div>

		{#if error}
			<div class="p-3 bg-danger-bg border border-danger/30 rounded text-danger text-sm mb-4">{error}</div>
		{/if}

		<FilterBar
			searchPlaceholder="Search log messages…"
			bind:searchValue={filterSearch}
			bind:filterValues
			filters={[
				{
					key: 'level',
					label: 'Level',
					options: [
						{ value: 'DEBUG', label: 'Debug' },
						{ value: 'INFO', label: 'Info' },
						{ value: 'WARNING', label: 'Warning' },
						{ value: 'ERROR', label: 'Error' },
						{ value: 'CRITICAL', label: 'Critical' },
					]
				}
			]}
		/>

		<!-- Terminal log area -->
		<div class="bg-bg-base rounded-lg border border-border overflow-auto max-h-[65vh]">
			{#if loading}
				<div class="p-4 font-mono text-[13px] text-text-secondary">Loading logs…</div>
			{:else if filteredLogs.length === 0}
				<div class="p-4 font-mono text-[13px] text-text-secondary">
					{logs.length === 0 ? 'No log entries.' : 'No logs match the current filter.'}
				</div>
			{:else}
				{#each filteredLogs as entry, i}
					{@const level = (entry.level || 'INFO').toUpperCase()}
					{@const borderClass = levelBorderClass[level] || ''}
					<div class="flex gap-3 px-4 py-0.5 hover:bg-bg-surface/40 border-b border-border/10 border-l-[3px] {borderClass || 'border-l-transparent'} transition-colors">
						<span class="font-mono text-[13px] text-text-tertiary text-right w-[3ch] shrink-0 select-none">{i + 1}</span>
						<span class="font-mono text-[13px] text-text-secondary shrink-0 w-40 truncate">{entry.timestamp || ''}</span>
						<span class="font-mono text-[13px] shrink-0 w-16 {levelTextClass[level] || 'text-text-secondary'}">{level}</span>
						<span class="font-mono text-[13px] text-text break-all">{entry.message || JSON.stringify(entry)}</span>
					</div>
				{/each}
			{/if}
		</div>

		{#if !loading && filteredLogs.length > 0}
			<p class="text-xs text-text-tertiary mt-2 text-right">{filteredLogs.length} of {logs.length} entries</p>
		{/if}
	</div>
</main>
