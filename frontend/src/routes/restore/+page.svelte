<svelte:head>
	<title>Restore | Arkive</title>
</svelte:head>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/restore/plan');
  });
</script>
