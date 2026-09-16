import type { Dispatch, SetStateAction } from 'react'
import type {
  HistoricalMapOverlay,
  HistoricalMapOverlayGroup,
} from './historicalOverlays'

export function matchesHistoricalMapFilter(
  overlay: HistoricalMapOverlay,
  filter: string,
): boolean {
  const normalizedFilter = filter.trim().toLowerCase()
  if (!normalizedFilter) return true

  return [
    overlay.title,
    overlay.shortTitle,
    overlay.siteName,
    overlay.seriesTitle,
    overlay.plateLabel,
    overlay.sourceFilename,
  ].some((value) => value?.toLowerCase().includes(normalizedFilter))
}

export function groupActiveCount(
  group: HistoricalMapOverlayGroup,
  activeOverlayIds: ReadonlySet<string>,
): number {
  return group.overlays.filter((overlay) => activeOverlayIds.has(overlay.id))
    .length
}

export function linkedExcavationAreaLabel(count: number): string {
  return count === 1 ? '1 linked area' : `${count} linked areas`
}

export function toggleExpandedSite(
  setExpandedSiteIds: Dispatch<SetStateAction<Set<string>>>,
  siteId: string,
): void {
  setExpandedSiteIds((current) => {
    const next = new Set(current)
    next.has(siteId) ? next.delete(siteId) : next.add(siteId)
    return next
  })
}
