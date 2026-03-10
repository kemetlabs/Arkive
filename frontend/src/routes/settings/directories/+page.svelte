<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import { api } from '$lib/api/client';
	import { addToast } from '$lib/stores/app';
	import { onMount } from 'svelte';
	import { FolderOpen } from 'lucide-svelte';
	import FormInput from '$lib/components/ui/FormInput.svelte';
	import StatusBadge from '$lib/components/shared/StatusBadge.svelte';

	let directories: any[] = [];
	let loading = true;
	let error = '';
	let newPath = '';
	let newLabel = '';

	onMount(async () => {
		try {
			const result = await api.listDirectories();
			directories = result.directories || [];
		} catch (e: any) {
			console.error(e);
			error = e.message || 'Failed to load directories';
		}
		loading = false;
	});

	async function addDir() {
		try {
			await api.addDirectory({ path: newPath, label: newLabel || newPath, exclude_patterns: [], enabled: true });
			addToast({ type: 'success', message: 'Directory added' });
			newPath = '';
			newLabel = '';
			const result = await api.listDirectories();
			directories = result.directories || [];
		} catch (e: any) {
			addToast({ type: 'error', message: e.message });
		}
	}

	async function removeDir(id: string) {
		try {
			await api.deleteDirectory(id);
			directories = directories.filter(d => d.id !== id);
			addToast({ type: 'success', message: 'Directory removed' });
		} catch (e: any) {
			addToast({ type: 'error', message: e.message });
		}
	}
</script>

<Header title="Watched Directories" />

<main class="p-6 space-y-6">
	{#if error}
		<div class="p-4 bg-danger-bg border border-danger/30 rounded text-danger text-sm">{error}</div>
	{/if}

	<div class="card">
		<h3 class="font-semibold text-text mb-4">Add Directory</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
			<div class="md:col-span-1">
				<FormInput
					id="new-dir-path"
					label="Path"
					bind:value={newPath}
					placeholder="/mnt/user/appdata"
					mono={true}
				/>
			</div>
			<div class="md:col-span-1">
				<FormInput
					id="new-dir-label"
					label="Label (optional)"
					bind:value={newLabel}
					placeholder="App Data"
				/>
			</div>
			<div>
				<button on:click={addDir} disabled={!newPath} class="btn-primary w-full disabled:opacity-50">Add</button>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="space-y-3">
			{#each Array(3) as _}
				<div class="card animate-skeleton h-16"></div>
			{/each}
		</div>
	{:else if directories.length === 0}
		<div class="card text-center py-12">
			<FolderOpen size={48} class="text-text-secondary mx-auto mb-4" />
			<p class="text-sm text-text-secondary">No directories configured.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each directories as dir}
				<div class="card flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-lg bg-bg-surface border border-border flex items-center justify-center flex-shrink-0">
							<FolderOpen size={14} class="text-text-secondary" />
						</div>
						<div>
							<p class="text-sm font-medium text-text">{dir.label || dir.path}</p>
							<p class="text-xs text-text-secondary font-mono mt-0.5">{dir.path}</p>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<StatusBadge status={dir.enabled ? 'success' : 'warning'} size="sm" />
						<button on:click={() => removeDir(dir.id)} class="text-text-secondary hover:text-danger" aria-label="Remove directory">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>
