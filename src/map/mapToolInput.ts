import type { Position } from 'geojson'

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
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? [longitude, latitude]
    : null
}
