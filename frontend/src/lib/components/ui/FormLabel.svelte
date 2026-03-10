<script lang="ts">
  export let label: string;
  export let htmlFor: string = '';
  export let required: boolean = false;
  /** Forward arbitrary classes */
  let className: string = '';
  export { className as class };
</script>

<label
  for={htmlFor}
  class="block text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1.5 {className}"
>
  {label}
  {#if required}<span class="text-danger ml-1">*</span>{/if}
</label>
