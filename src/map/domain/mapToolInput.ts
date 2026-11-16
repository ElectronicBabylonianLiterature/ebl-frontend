import type { Position } from 'geojson'
import { isFinitePosition } from 'map/domain/geodesy'

const EDITABLE_TAG_NAMES = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || EDITABLE_TAG_NAMES.has(target.tagName))
  )
}

export function finitePosition(
  longitude: number,
  latitude: number,
): Position | null {
  const position: Position = [longitude, latitude]
  return isFinitePosition(position) ? position : null
}
