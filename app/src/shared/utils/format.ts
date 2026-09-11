export function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

export function formatTimeMs(ms: number): string {
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
