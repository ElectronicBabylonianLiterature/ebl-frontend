import type { FindspotProperties } from 'map/domain/provenanceToGeoJson'
import { buildFragmentSearchLink } from 'map/domain/mapLinks'

export interface FindspotPopupProperties extends Pick<
  FindspotProperties,
  'name' | 'abbreviation' | 'parent' | 'geometryType'
> {
  coordinates?: {
    latitude: number
    longitude: number
  }
}

function formatCoordinate(
  value: number,
  positiveHemisphere: string,
  negativeHemisphere: string,
): string {
  const hemisphere = value < 0 ? negativeHemisphere : positiveHemisphere
  return `${Math.abs(value).toFixed(2)}°${hemisphere}`
}

function formatCoordinates(coordinates: {
  latitude: number
  longitude: number
}): string {
  return `${formatCoordinate(coordinates.latitude, 'N', 'S')}, ${formatCoordinate(
    coordinates.longitude,
    'E',
    'W',
  )}`
}

function hasModifierKey(event: MouseEvent): boolean {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !hasModifierKey(event)
}

function createRow(text: string): HTMLDivElement {
  const row = document.createElement('div')
  row.textContent = text
  return row
}

export function createFindspotPopup(
  properties: FindspotPopupProperties,
  onNavigate: (path: string) => void,
): HTMLDivElement {
  const { name, abbreviation, parent, geometryType, coordinates } = properties
  const content = document.createElement('div')
  const titleRow = document.createElement('div')
  const title = document.createElement('strong')
  const link = document.createElement('a')
  const fragmentSearchLink = buildFragmentSearchLink(name)

  title.textContent = name
  titleRow.append(title)
  link.textContent = 'View fragments'
  link.setAttribute('href', fragmentSearchLink)
  link.addEventListener('click', (event) => {
    if (!isPlainLeftClick(event)) return

    event.preventDefault()
    onNavigate(fragmentSearchLink)
  })

  content.append(
    titleRow,
    createRow(parent ? `${parent} · ${abbreviation}` : abbreviation),
  )

  if (coordinates) {
    content.append(createRow(formatCoordinates(coordinates)))
  }

  content.append(
    createRow(
      geometryType === 'polygon' ? 'Approximate area location' : 'Single point',
    ),
    link,
  )

  return content
}
