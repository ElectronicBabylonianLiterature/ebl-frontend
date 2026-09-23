const MAP_STYLE_HOST = 'basemaps.cartocdn.com'
const MAP_STYLE_PATH = '/gl/positron-gl-style/style.json'

export const MAP_STYLE_URL = `https://${MAP_STYLE_HOST}${MAP_STYLE_PATH}`

export interface MapLibreErrorEvent {
  error?: {
    message?: string
    url?: string
  }
  sourceId?: string
  layer?: { id?: string }
  tile?: unknown
}

type MapLibreErrorEventWithError = MapLibreErrorEvent & {
  error: NonNullable<MapLibreErrorEvent['error']>
}

function isStyleUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return (
      parsed.hostname.toLowerCase() === MAP_STYLE_HOST &&
      parsed.pathname === MAP_STYLE_PATH
    )
  } catch {
    return false
  }
}

function toMapErrorEvent(
  event: MapLibreErrorEvent | unknown,
): MapLibreErrorEventWithError | null {
  if (!event || typeof event !== 'object') return null

  const mapEvent = event as MapLibreErrorEvent
  if (!mapEvent.error || typeof mapEvent.error !== 'object') return null

  return mapEvent as MapLibreErrorEventWithError
}

function isSourceOrLayerScoped(event: MapLibreErrorEvent): boolean {
  return (
    typeof event.sourceId === 'string' || typeof event.layer?.id === 'string'
  )
}

function isTileScoped(event: MapLibreErrorEvent): boolean {
  return event.tile !== undefined
}

export function isMapBackgroundLoadError(
  event: MapLibreErrorEvent | unknown,
): boolean {
  const mapEvent = toMapErrorEvent(event)
  if (!mapEvent) return false

  if (isSourceOrLayerScoped(mapEvent) || isTileScoped(mapEvent)) return false

  const { url } = mapEvent.error
  return typeof url === 'string' && isStyleUrl(url)
}

export function getReportableMapError(
  event: MapLibreErrorEvent | unknown,
): Error | null {
  const mapEvent = toMapErrorEvent(event)
  if (!mapEvent) return null

  const { error } = mapEvent
  if (typeof error.message !== 'string') return null

  if (isTileScoped(mapEvent) || isMapBackgroundLoadError(event)) return null

  return error instanceof Error ? error : new Error(error.message)
}
