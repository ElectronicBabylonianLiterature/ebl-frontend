import type { MapGeoJSONFeature } from 'maplibre-gl'
import type { FindspotPopupProperties } from 'map/createFindspotPopup'
import type { FindspotProperties } from 'map/provenanceToGeoJson'

function isGeometryType(
  value: unknown,
): value is FindspotProperties['geometryType'] {
  return value === 'point' || value === 'polygon'
}

export function getPopupProperties(
  feature: MapGeoJSONFeature,
  pointCoordinates: [number, number],
): FindspotPopupProperties | null {
  const name = feature.properties?.name
  const abbreviation = feature.properties?.abbreviation
  const parent = feature.properties?.parent
  const geometryType = feature.properties?.geometryType

  if (typeof name !== 'string' || typeof abbreviation !== 'string') {
    return null
  }

  if (parent !== undefined && parent !== null && typeof parent !== 'string') {
    return null
  }

  if (!isGeometryType(geometryType)) {
    return null
  }

  return {
    name,
    abbreviation,
    parent: typeof parent === 'string' ? parent : undefined,
    geometryType,
    coordinates: {
      latitude: pointCoordinates[1],
      longitude: pointCoordinates[0],
    },
  }
}
