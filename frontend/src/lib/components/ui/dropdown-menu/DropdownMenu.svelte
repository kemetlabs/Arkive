<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

  export let open = false;
</script>

<DropdownMenuPrimitive.Root bind:open>
  <slot />
</DropdownMenuPrimitive.Root>
