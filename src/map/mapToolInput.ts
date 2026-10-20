import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'

export function isFiniteToolPosition(position: Position): boolean {
  return position.length >= 2 && position.slice(0, 2).every(Number.isFinite)
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

export function subscribeToolInput(
  mapRef: MutableRefObject<MapLibreMap | null>,
  addPosition: (position: Position) => void,
  clear: () => void,
): () => void {
  const map = mapRef.current
  if (!map) return () => undefined
  let isDisposed = false
  const isCurrent = (): boolean => !isDisposed && mapRef.current === map
  const collect = (event: MapMouseEvent): void => {
    if (!isCurrent()) return
    const position = [event.lngLat.lng, event.lngLat.lat]
    if (isFiniteToolPosition(position)) addPosition(position)
  }
  const handleKey = (event: KeyboardEvent): void => {
    if (
      !isCurrent() ||
      event.key !== 'Escape' ||
      isEditableTarget(event.target)
    )
      return
    event.preventDefault()
    clear()
  }
  map.on('click', collect)
  window.addEventListener('keydown', handleKey)
  return () => {
    isDisposed = true
    map.off('click', collect)
    window.removeEventListener('keydown', handleKey)
  }
}
