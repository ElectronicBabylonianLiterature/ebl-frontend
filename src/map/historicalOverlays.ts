import { assertValidHistoricalMapOverlays } from 'map/historicalOverlayValidation'
import { generatedHistoricalMapOverlays } from 'map/historicalOverlays.generated'
export interface HistoricalMapOverlay {
  readonly id: string
  readonly siteId: string
  readonly siteName: string
  readonly title: string
  readonly shortTitle?: string
  readonly dateLabel?: string
  readonly description?: string
  readonly cartographer?: string
  readonly institution?: string
  readonly sourceFilename: string
  readonly seriesId?: string
  readonly seriesTitle?: string
  readonly plateLabel?: string
  readonly sourceChecksum?: string
  readonly attribution: string
  readonly sourceUrl?: string
  readonly type: 'raster-tiles'
  readonly tiles: readonly string[]
  readonly bounds?: readonly [number, number, number, number]
  readonly minZoom?: number
  readonly maxZoom?: number
  readonly tileSize?: number
  readonly defaultOpacity: number
}

export type HistoricalMapOverlayValidationField =
  | keyof HistoricalMapOverlay
  | 'manifest'

export interface HistoricalMapOverlayValidationError {
  readonly overlayId?: string
  readonly field: HistoricalMapOverlayValidationField
  readonly message: string
}

export {
  isSafeOverlayUrl,
  validateHistoricalMapOverlay,
  validateHistoricalMapOverlays,
  assertValidHistoricalMapOverlays,
} from 'map/historicalOverlayValidation'

export const historicalMapOverlays: readonly HistoricalMapOverlay[] =
  generatedHistoricalMapOverlays

export interface ActiveHistoricalOverlay {
  readonly id: string
  readonly opacity: number
  readonly visible: boolean
}

export interface HistoricalMapOverlaySeries {
  readonly seriesId: string
  readonly seriesTitle: string
  readonly overlays: readonly HistoricalMapOverlay[]
}

export function historicalOverlayLabel(overlay: HistoricalMapOverlay): string {
  if (overlay.seriesTitle && overlay.plateLabel) {
    return `${overlay.seriesTitle} — ${overlay.plateLabel}`
  }

  return [overlay.shortTitle || overlay.title, overlay.dateLabel]
    .filter(Boolean)
    .join(' — ')
}

export function groupHistoricalMapOverlaySeries(
  overlays: readonly HistoricalMapOverlay[],
): readonly HistoricalMapOverlaySeries[] {
  const series = new Map<string, HistoricalMapOverlay[]>()
  const titles = new Map<string, string>()

  for (const overlay of overlays) {
    if (!overlay.seriesId || !overlay.seriesTitle) continue

    titles.set(overlay.seriesId, overlay.seriesTitle)
    const group = series.get(overlay.seriesId) ?? []
    group.push(overlay)
    series.set(overlay.seriesId, group)
  }

  return Array.from(series.entries()).map(([seriesId, overlaysInSeries]) => ({
    seriesId,
    seriesTitle: titles.get(seriesId) ?? seriesId,
    overlays: overlaysInSeries,
  }))
}

export function unionHistoricalOverlayBounds(
  overlays: readonly HistoricalMapOverlay[],
): readonly [number, number, number, number] | null {
  const bounds = overlays
    .map((overlay) => overlay.bounds)
    .filter((value): value is readonly [number, number, number, number] =>
      Boolean(value),
    )

  if (bounds.length === 0) return null

  return [
    Math.min(...bounds.map((bound) => bound[0])),
    Math.min(...bounds.map((bound) => bound[1])),
    Math.max(...bounds.map((bound) => bound[2])),
    Math.max(...bounds.map((bound) => bound[3])),
  ]
}

export interface HistoricalMapOverlayGroup {
  readonly siteId: string
  readonly siteName: string
  readonly overlays: readonly HistoricalMapOverlay[]
}

export function groupHistoricalMapOverlaysBySite(
  overlays: readonly HistoricalMapOverlay[],
): readonly HistoricalMapOverlayGroup[] {
  const groups = new Map<string, HistoricalMapOverlay[]>()
  const siteNames = new Map<string, string>()

  for (const overlay of overlays) {
    siteNames.set(overlay.siteId, overlay.siteName)
    const group = groups.get(overlay.siteId) ?? []
    group.push(overlay)
    groups.set(overlay.siteId, group)
  }

  return Array.from(groups.entries()).map(([siteId, siteOverlays]) => ({
    siteId,
    siteName: siteNames.get(siteId) ?? siteId,
    overlays: siteOverlays,
  }))
}

export const validatedHistoricalMapOverlays = assertValidHistoricalMapOverlays(
  historicalMapOverlays,
)
