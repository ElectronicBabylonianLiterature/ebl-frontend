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

function isSourceOrLayerScoped(event: MapLibreErrorEvent): boolean {
  return (
    typeof event.sourceId === 'string' ||
    typeof event.layer?.id === 'string' ||
    event.tile !== undefined
  )
}

export function isMapBackgroundLoadError(
  event: MapLibreErrorEvent | unknown,
): boolean {
  if (!event || typeof event !== 'object') return false

  const mapEvent = event as MapLibreErrorEvent
  const error = mapEvent.error
  if (!error || typeof error !== 'object') return false

  if (isSourceOrLayerScoped(mapEvent)) return false

  return typeof error.url === 'string' && isStyleUrl(error.url)
}

export function getReportableMapError(
  event: MapLibreErrorEvent | unknown,
): Error | null {
  if (!event || typeof event !== 'object') return null

  const mapEvent = event as MapLibreErrorEvent
  const error = mapEvent.error
  if (
    !error ||
    typeof error !== 'object' ||
    typeof error.message !== 'string'
  ) {
    return null
  }

  if (mapEvent.tile !== undefined || !isSourceOrLayerScoped(mapEvent)) {
    return null
  }

  return error instanceof Error ? error : new Error(error.message)
}
