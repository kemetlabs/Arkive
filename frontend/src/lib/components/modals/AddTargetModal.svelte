<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ProviderIcon from '../shared/ProviderIcon.svelte';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '$lib/components/ui/dialog';
  import { targetSchema } from '$lib/schemas/target';

  export let open: boolean = false;
  export let loading: boolean = false;

  const dispatch = createEventDispatcher();

  let errors: Record<string, string> = {};

  let name = '';
  let type: 'b2' | 'dropbox' | 'gdrive' | 's3' | 'local' | 'sftp' | 'wasabi' = 'b2';
  let keyId = '';
  let appKey = '';
  let bucket = '';
  let token = '';
  let endpoint = '';
  let accessKey = '';
  let secretKey = '';
  let path = '';
  let host = '';
  let port = 22;
  let username = '';
  let password = '';
  let remotePath = '';

  let region = '';

  const providers = [
    { value: 'b2', label: 'Backblaze B2' },
    { value: 's3', label: 'S3-Compatible' },
    { value: 'wasabi', label: 'Wasabi' },
    { value: 'dropbox', label: 'Dropbox' },
    { value: 'gdrive', label: 'Google Drive' },
    { value: 'sftp', label: 'SFTP' },
    { value: 'local', label: 'Local Path' },
  ] as const;

  function submit() {
    const payload = {
      name, type,
      key_id: keyId, app_key: appKey, bucket, token, endpoint,
      access_key: accessKey, secret_key: secretKey, path,
      host, port, username, password, remote_path: remotePath,
    };
    const result = targetSchema.safeParse(payload);
    if (!result.success) {
      errors = Object.fromEntries(result.error.issues.map(e => [e.path.map(String).join('.') || '_root', e.message]));
      return;
    }
    errors = {};
    const data: Record<string, unknown> = { name, type };
    if (type === 'b2') Object.assign(data, { key_id: keyId, app_key: appKey, bucket });
    if (type === 's3') Object.assign(data, { endpoint, access_key: accessKey, secret_key: secretKey, bucket });
    if (type === 'wasabi') Object.assign(data, { access_key: accessKey, secret_key: secretKey, bucket, region });
    if (type === 'dropbox' || type === 'gdrive') Object.assign(data, { token });
    if (type === 'sftp') Object.assign(data, { host, port, username, password, remote_path: remotePath });
    if (type === 'local') Object.assign(data, { path });
    dispatch('submit', data);
  }

  function cancel() { dispatch('cancel'); open = false; }

  function providerBtnClass(pValue: string): string {
    return type === pValue
      ? 'border-primary bg-primary/10'
      : 'border-border';
  }
</script>

<Dialog bind:open>
  <DialogContent class="max-w-lg max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Add Storage Target</DialogTitle>
      <DialogDescription>Configure a new backup storage destination.</DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-2">
      <div>
        <label for="target-name" class="text-sm font-medium text-text block mb-1">Name</label>
        <input id="target-name" bind:value={name} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text" placeholder="My B2 Bucket" />
        {#if errors.name}<p class="text-xs text-danger mt-1">{errors.name}</p>{/if}
      </div>

      <div>
        <span class="text-sm font-medium text-text block mb-1" id="provider-label">Provider</span>
        <div class="grid grid-cols-3 gap-2" role="group" aria-labelledby="provider-label">
          {#each providers as p}
            <button
              on:click={() => type = p.value}
              class="flex items-center gap-2 p-2 rounded-md border text-sm transition-colors {providerBtnClass(p.value)}"
            >
              <ProviderIcon provider={p.value} size="sm" />
              {p.label}
            </button>
          {/each}
        </div>
      </div>

      {#if type === 'b2'}
        <div><label for="b2-key-id" class="text-sm font-medium text-text block mb-1">Key ID</label><input id="b2-key-id" bind:value={keyId} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="b2-app-key" class="text-sm font-medium text-text block mb-1">Application Key</label><input id="b2-app-key" bind:value={appKey} type="password" class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="b2-bucket" class="text-sm font-medium text-text block mb-1">Bucket Name</label><input id="b2-bucket" bind:value={bucket} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
      {:else if type === 's3'}
        <div><label for="s3-endpoint" class="text-sm font-medium text-text block mb-1">Endpoint URL</label><input id="s3-endpoint" bind:value={endpoint} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" placeholder="https://s3.us-east-1.amazonaws.com" /></div>
        <div><label for="s3-access-key" class="text-sm font-medium text-text block mb-1">Access Key</label><input id="s3-access-key" bind:value={accessKey} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="s3-secret-key" class="text-sm font-medium text-text block mb-1">Secret Key</label><input id="s3-secret-key" bind:value={secretKey} type="password" class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="s3-bucket" class="text-sm font-medium text-text block mb-1">Bucket</label><input id="s3-bucket" bind:value={bucket} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
      {:else if type === 'wasabi'}
        <div><label for="wasabi-access-key" class="text-sm font-medium text-text block mb-1">Access Key</label><input id="wasabi-access-key" bind:value={accessKey} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="wasabi-secret-key" class="text-sm font-medium text-text block mb-1">Secret Key</label><input id="wasabi-secret-key" bind:value={secretKey} type="password" class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="wasabi-bucket" class="text-sm font-medium text-text block mb-1">Bucket</label><input id="wasabi-bucket" bind:value={bucket} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="wasabi-region" class="text-sm font-medium text-text block mb-1">Region</label><input id="wasabi-region" bind:value={region} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" placeholder="us-east-1" /></div>
      {:else if type === 'dropbox' || type === 'gdrive'}
        <div><label for="oauth-token" class="text-sm font-medium text-text block mb-1">OAuth Token</label><input id="oauth-token" bind:value={token} type="password" class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
      {:else if type === 'sftp'}
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2"><label for="sftp-host" class="text-sm font-medium text-text block mb-1">Host</label><input id="sftp-host" bind:value={host} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
          <div><label for="sftp-port" class="text-sm font-medium text-text block mb-1">Port</label><input id="sftp-port" bind:value={port} type="number" class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        </div>
        <div><label for="sftp-username" class="text-sm font-medium text-text block mb-1">Username</label><input id="sftp-username" bind:value={username} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="sftp-password" class="text-sm font-medium text-text block mb-1">Password</label><input id="sftp-password" bind:value={password} type="password" class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" /></div>
        <div><label for="sftp-remote-path" class="text-sm font-medium text-text block mb-1">Remote Path</label><input id="sftp-remote-path" bind:value={remotePath} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" placeholder="/backups/arkive" /></div>
      {:else if type === 'local'}
        <div><label for="local-path" class="text-sm font-medium text-text block mb-1">Local Path</label><input id="local-path" bind:value={path} class="w-full bg-page border border-border rounded-md px-3 py-2 text-sm text-text font-mono" placeholder="/mnt/user/backups" /></div>
      {/if}
    </div>

    {#if errors._root}<p class="text-xs text-danger mt-2">{errors._root}</p>{/if}

    <DialogFooter>
      <button on:click={cancel} class="px-4 py-2 text-sm rounded-md border border-border text-text-secondary hover:text-text transition-colors">Cancel</button>
      <button on:click={submit} disabled={loading} class="px-4 py-2 text-sm rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        {#if loading}<span class="animate-spin mr-1">⟳</span>{/if}
        Add Target
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
