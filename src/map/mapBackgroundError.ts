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

function includesStyleUrl(value: string): boolean {
  const normalized = value.toLowerCase()
  return (
    normalized.includes(MAP_STYLE_URL) ||
    (normalized.includes(MAP_STYLE_HOST) && normalized.includes(MAP_STYLE_PATH))
  )
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

  if (typeof url === 'string' && includesStyleUrl(url)) {
    return true
  }

  if (typeof message !== 'string') return false

  return includesStyleUrl(message) && isStyleDocumentResource(mapEvent)
}
