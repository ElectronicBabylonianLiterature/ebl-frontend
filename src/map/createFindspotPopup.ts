import type { FindspotProperties } from './provenanceToGeoJson'
import { buildFragmentSearchLink } from './mapLinks'

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

function createRow(text: string): HTMLDivElement {
  const row = document.createElement('div')
  row.textContent = text
  return row
}

export function createFindspotPopup(
  properties: FindspotPopupProperties,
): HTMLDivElement {
  const { name, abbreviation, parent, geometryType, coordinates } = properties
  const content = document.createElement('div')
  const titleRow = document.createElement('div')
  const title = document.createElement('strong')
  const link = document.createElement('a')

  title.textContent = name
  titleRow.append(title)
  link.textContent = 'View fragments'
  link.setAttribute('href', buildFragmentSearchLink(name))

  content.append(
    titleRow,
    createRow(parent ? `${parent} · ${abbreviation}` : abbreviation),
  )

  if (coordinates) {
    content.append(createRow(formatCoordinates(coordinates)))
  }

  content.append(
    createRow(
      geometryType === 'polygon' ? 'Area boundary available' : 'Single point',
    ),
    link,
  )

  return content
}
