export interface HistoricalMapOverlay {
  readonly id: string
  readonly title: string
  readonly shortTitle?: string
  readonly dateLabel?: string
  readonly description?: string
  readonly cartographer?: string
  readonly institution?: string
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

const URL_SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/
const URL_BASE = 'https://www.ebl.lmu.de'

export const historicalMapOverlays: readonly HistoricalMapOverlay[] = [
  {
    id: 'assur-andrae-1938-beilage',
    title: 'Andrae 1938, Aššur, Beilage',
    shortTitle: 'Andrae 1938',
    dateLabel: '1938',
    description:
      'Georeferenced historical plan of Aššur. The overlay is suitable for site-scale orientation, but historical source material and georeferencing may include spatial inaccuracies.',
    attribution:
      'Andrae 1938, Aššur, Beilage. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
    type: 'raster-tiles',
    tiles: ['/historical-maps/assur-andrae-1938-beilage/tiles/{z}/{x}/{y}.png'],
    bounds: [43.2507948, 35.4442168, 43.268817, 35.4629941],
    minZoom: 12,
    maxZoom: 17,
    tileSize: 256,
    defaultOpacity: 0.7,
  },
]

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function isSafeOverlayUrl(url: string): boolean {
  if (!isNonEmptyString(url)) {
    return false
  }

  try {
    const parsedUrl = new URL(url, URL_BASE)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

function validateBounds(
  overlay: HistoricalMapOverlay,
): readonly HistoricalMapOverlayValidationError[] {
  if (!overlay.bounds) {
    return []
  }

  const errors: HistoricalMapOverlayValidationError[] = []

  if (
    !Array.isArray(overlay.bounds) ||
    overlay.bounds.length !== 4 ||
    !overlay.bounds.every(isFiniteNumber)
  ) {
    errors.push({
      overlayId: overlay.id,
      field: 'bounds',
      message: 'bounds must contain four finite numbers',
    })
    return errors
  }

  const [west, south, east, north] = overlay.bounds

  if (west < -180 || west > 180 || east < -180 || east > 180) {
    errors.push({
      overlayId: overlay.id,
      field: 'bounds',
      message: 'west and east bounds must be valid longitudes',
    })
  }

  if (south < -90 || south > 90 || north < -90 || north > 90) {
    errors.push({
      overlayId: overlay.id,
      field: 'bounds',
      message: 'south and north bounds must be valid latitudes',
    })
  }

  if (west >= east || south >= north) {
    errors.push({
      overlayId: overlay.id,
      field: 'bounds',
      message: 'bounds must be ordered as [west, south, east, north]',
    })
  }

  return errors
}

function validateZoomRange(
  overlay: HistoricalMapOverlay,
): readonly HistoricalMapOverlayValidationError[] {
  const errors: HistoricalMapOverlayValidationError[] = []

  if (overlay.minZoom !== undefined) {
    if (!isFiniteNumber(overlay.minZoom) || overlay.minZoom < 0) {
      errors.push({
        overlayId: overlay.id,
        field: 'minZoom',
        message: 'minZoom must be a finite non-negative number',
      })
    }
  }

  if (overlay.maxZoom !== undefined) {
    if (!isFiniteNumber(overlay.maxZoom) || overlay.maxZoom < 0) {
      errors.push({
        overlayId: overlay.id,
        field: 'maxZoom',
        message: 'maxZoom must be a finite non-negative number',
      })
    }
  }

  if (
    isFiniteNumber(overlay.minZoom) &&
    isFiniteNumber(overlay.maxZoom) &&
    overlay.minZoom > overlay.maxZoom
  ) {
    errors.push({
      overlayId: overlay.id,
      field: 'minZoom',
      message: 'minZoom must not exceed maxZoom',
    })
  }

  return errors
}

export function validateHistoricalMapOverlay(
  overlay: HistoricalMapOverlay,
): readonly HistoricalMapOverlayValidationError[] {
  const errors: HistoricalMapOverlayValidationError[] = []

  if (!URL_SAFE_ID_PATTERN.test(overlay.id)) {
    errors.push({
      overlayId: overlay.id,
      field: 'id',
      message: 'id must be stable and URL-safe',
    })
  }

  if (!isNonEmptyString(overlay.title)) {
    errors.push({
      overlayId: overlay.id,
      field: 'title',
      message: 'title must be non-empty',
    })
  }

  if (!isNonEmptyString(overlay.attribution)) {
    errors.push({
      overlayId: overlay.id,
      field: 'attribution',
      message: 'attribution must be non-empty',
    })
  }

  if (overlay.type !== 'raster-tiles') {
    errors.push({
      overlayId: overlay.id,
      field: 'type',
      message: 'type must be raster-tiles',
    })
  }

  if (
    !Array.isArray(overlay.tiles) ||
    overlay.tiles.length === 0 ||
    overlay.tiles.some((tileUrl) => !isSafeOverlayUrl(tileUrl))
  ) {
    errors.push({
      overlayId: overlay.id,
      field: 'tiles',
      message: 'tiles must contain at least one relative, HTTP, or HTTPS URL',
    })
  }

  if (overlay.sourceUrl !== undefined && !isSafeOverlayUrl(overlay.sourceUrl)) {
    errors.push({
      overlayId: overlay.id,
      field: 'sourceUrl',
      message: 'sourceUrl must be relative, HTTP, or HTTPS',
    })
  }

  if (
    !isFiniteNumber(overlay.defaultOpacity) ||
    overlay.defaultOpacity < 0 ||
    overlay.defaultOpacity > 1
  ) {
    errors.push({
      overlayId: overlay.id,
      field: 'defaultOpacity',
      message: 'defaultOpacity must be between 0 and 1',
    })
  }

  if (
    overlay.tileSize !== undefined &&
    (!isFiniteNumber(overlay.tileSize) || overlay.tileSize <= 0)
  ) {
    errors.push({
      overlayId: overlay.id,
      field: 'tileSize',
      message: 'tileSize must be a positive finite number',
    })
  }

  return [...errors, ...validateBounds(overlay), ...validateZoomRange(overlay)]
}

export function validateHistoricalMapOverlays(
  overlays: readonly HistoricalMapOverlay[],
): readonly HistoricalMapOverlayValidationError[] {
  const errors = overlays.flatMap(validateHistoricalMapOverlay)
  const seenIds = new Set<string>()
  const duplicateIds = new Set<string>()

  for (const overlay of overlays) {
    if (seenIds.has(overlay.id)) {
      duplicateIds.add(overlay.id)
    }
    seenIds.add(overlay.id)
  }

  return [
    ...errors,
    ...Array.from(duplicateIds).map((overlayId) => ({
      overlayId,
      field: 'manifest' as const,
      message: 'overlay ids must be unique',
    })),
  ]
}

export function assertValidHistoricalMapOverlays(
  overlays: readonly HistoricalMapOverlay[],
): readonly HistoricalMapOverlay[] {
  const errors = validateHistoricalMapOverlays(overlays)

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const prefix = error.overlayId ? `${error.overlayId}: ` : ''
        return `${prefix}${error.field} ${error.message}`
      })
      .join('; ')
    throw new Error(`Invalid historical map overlay manifest: ${errorMessages}`)
  }

  return overlays
}

export const validatedHistoricalMapOverlays = assertValidHistoricalMapOverlays(
  historicalMapOverlays,
)
