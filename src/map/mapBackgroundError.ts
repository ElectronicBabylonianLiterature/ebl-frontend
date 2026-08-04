export const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const MAP_STYLE_HOST = 'basemaps.cartocdn.com'
const MAP_STYLE_PATH = '/gl/positron-gl-style/style.json'

export interface MapLibreErrorEvent {
  error?: {
    message?: string
  }
  resourceType?: string
  url?: string
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

function includesStyleUrl(value: string): boolean {
  return value.toLowerCase().includes(MAP_STYLE_URL)
}

function isStyleDocumentResource(event: MapLibreErrorEvent): boolean {
  const resourceType = event.resourceType?.toLowerCase()
  return resourceType === 'style' || resourceType === 'styledocument'
}

export function isMapBackgroundLoadError(
  event: MapLibreErrorEvent | unknown,
): boolean {
  if (!event || typeof event !== 'object') return false

  const mapEvent = event as MapLibreErrorEvent
  const message = mapEvent.error?.message
  const url = mapEvent.url

  if (typeof url === 'string' && isStyleUrl(url)) {
    return true
  }

  if (typeof message !== 'string') return false

  return includesStyleUrl(message) && isStyleDocumentResource(mapEvent)
}
