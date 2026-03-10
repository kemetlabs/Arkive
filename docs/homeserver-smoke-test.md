# Homeserver Smoke Test

Use this after deploying Arkive to a real host.

## Deploy assumptions

- Mount `/var/run/docker.sock:/var/run/docker.sock:ro`
- Mount `/mnt/user/appdata/arkive:/config`
- For flash backup on Unraid, mount `/boot/config:/boot-config:ro`
- If you want broader discovery/backup coverage, mount `/mnt/user:/mnt/user:ro`
- On Unraid, run the container as `root` (`--user 0:0`) for full flash and SQLite coverage

## Run the smoke test

Public-only checks:

```bash
scripts/homeserver-smoke-test.sh --base-url http://YOUR_HOST:8200
```

Full checks with API key:

```bash
scripts/homeserver-smoke-test.sh \
  --base-url http://YOUR_HOST:8200 \
  --api-key ark_your_key_here
```

## What the script verifies

- `GET /api/status` is reachable without auth
- `X-API-Key` header auth still works for API clients
- browser session login works through `/api/auth/login`
- session cookies work for protected GET requests
- restore plan markdown is accessible
- restore plan PDF downloads
- logout clears the browser session cookie

## Suggested manual checks after the script

1. Open the UI and confirm setup/login flow behaves correctly in a browser.
2. Trigger one small backup job and verify it completes.
3. Re-check `GET /api/status` after the backup run.
4. Browse snapshots or run a dry-run restore if backup data exists.
