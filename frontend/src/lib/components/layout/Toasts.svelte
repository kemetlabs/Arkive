<script lang="ts">
	import { toasts } from '$lib/stores/app';
	import { cn } from '$lib/utils/cn';
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite" role="status">
	{#each $toasts as toast (toast.id)}
		<div class={cn(
			'px-4 py-3 rounded-lg shadow-lg border text-sm max-w-sm animate-slide-in',
			toast.type === 'success' && 'bg-success/10 border-success/30 text-success',
			toast.type === 'error' && 'bg-danger/10 border-danger/30 text-danger',
			toast.type === 'warning' && 'bg-warning/10 border-warning/30 text-warning',
			toast.type === 'info' && 'bg-primary/10 border-primary/30 text-primary'
		)}>
			{toast.message}
		</div>
	{/each}
</div>

<style>
	@keyframes slide-in {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}
</style>
