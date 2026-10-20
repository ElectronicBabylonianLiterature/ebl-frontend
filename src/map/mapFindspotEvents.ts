import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  INTERACTIVE_LAYER_IDS,
  resetPointerCursor,
  setPointerCursor,
  showPointerCursor,
} from 'map/mapCursor'
import {
  type MapLibreErrorEvent,
  getReportableMapError,
  isMapBackgroundLoadError,
} from 'map/mapBackgroundError'

interface FindspotMapEvents {
  readonly isActive: () => boolean
  readonly onStyleLoad: () => void
  readonly onClick: (event: MapMouseEvent) => void
  readonly reportError: (error: Error) => void
  readonly onBackgroundErrorChange?: (hasError: boolean) => void
}

function reportMapError(
  event: MapLibreErrorEvent,
  events: FindspotMapEvents,
): void {
  if (isMapBackgroundLoadError(event)) {
    events.onBackgroundErrorChange?.(true)
    return
  }
  const error = getReportableMapError(event)
  if (error) events.reportError(error)
}

export function subscribeFindspotMapEvents(
  map: MapLibreMap,
  styleLoadEvent: 'load' | 'style.load',
  events: FindspotMapEvents,
): () => void {
  const handleStyleLoad = (): void => {
    if (events.isActive()) events.onStyleLoad()
  }
  const handleClick = (event: MapMouseEvent): void => {
    if (events.isActive()) events.onClick(event)
  }
  const handleMouseMove = (event: MapMouseEvent): void => {
    if (events.isActive()) setPointerCursor(map, event)
  }
  const handleMouseEnter = (): void => {
    if (events.isActive()) showPointerCursor(map)
  }
  const handleMouseLeave = (): void => {
    if (events.isActive()) resetPointerCursor(map)
  }
  const handleError = (event: MapLibreErrorEvent): void => {
    if (events.isActive()) reportMapError(event, events)
  }

  map.on(styleLoadEvent, handleStyleLoad)
  map.on('click', handleClick)
  map.on('mousemove', handleMouseMove)
  map.on('error', handleError)
  INTERACTIVE_LAYER_IDS.forEach((layerId) => {
    map.on('mouseenter', layerId, handleMouseEnter)
    map.on('mouseleave', layerId, handleMouseLeave)
  })

  return () => {
    map.off(styleLoadEvent, handleStyleLoad)
    map.off('click', handleClick)
    map.off('mousemove', handleMouseMove)
    map.off('error', handleError)
    INTERACTIVE_LAYER_IDS.forEach((layerId) => {
      map.off('mouseenter', layerId, handleMouseEnter)
      map.off('mouseleave', layerId, handleMouseLeave)
    })
  }
}
