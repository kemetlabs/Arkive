/**
 * Playwright global-setup: no-op placeholder.
 *
 * IMPORTANT: Playwright runs globalSetup AFTER webServers start.
 * Do NOT kill processes here — it would kill the servers Playwright
 * just launched. Stale-process cleanup is handled by each webServer
 * command prefix instead.
 */
export default function globalSetup() {
  // intentionally empty — server cleanup is in the webServer commands
}
