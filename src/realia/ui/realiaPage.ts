export function getRealiaPageUrl(identifier: string): string {
  return `/tools/realia/${encodeURIComponent(identifier)}`
}

export function openRealiaPageInNewTab(identifier: string): void {
  window.open(getRealiaPageUrl(identifier), '_blank', 'noopener,noreferrer')
}
