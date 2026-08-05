export const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const MAP_STYLE_HOST = 'basemaps.cartocdn.com'
const MAP_STYLE_PATH = '/gl/positron-gl-style/style.json'

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
  hasStyleLoaded: boolean,
): boolean {
  if (!event || typeof event !== 'object') return false

  const mapEvent = event as MapLibreErrorEvent
  const error = mapEvent.error
  if (!error || typeof error !== 'object') return false

  if (isSourceOrLayerScoped(mapEvent)) return false

  const url = error.url
  if (typeof url === 'string') {
    return isStyleUrl(url)
  }

  return !hasStyleLoaded
}
