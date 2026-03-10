export function load({ params }: { params: { runId: string } }) {
  return { runId: params.runId };
}
