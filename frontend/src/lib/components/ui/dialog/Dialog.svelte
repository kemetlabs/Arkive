<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';

  export let open = false;
</script>

<DialogPrimitive.Root bind:open>
  <slot />
</DialogPrimitive.Root>
