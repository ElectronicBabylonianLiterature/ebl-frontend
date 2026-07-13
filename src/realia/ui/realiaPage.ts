export function getRealiaPageUrl(realiaId: string): string {
  return `/tools/realia/${encodeURIComponent(realiaId)}`
}

export function openRealiaPageInNewTab(realiaId: string): void {
  window.open(getRealiaPageUrl(realiaId), '_blank', 'noopener,noreferrer')
}
