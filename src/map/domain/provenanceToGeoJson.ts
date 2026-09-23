import type { FeatureCollection, Point } from 'geojson'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry as getProvenanceGeometry,
} from 'fragmentarium/domain/Provenance'
import { isValidPointCoordinate } from 'map/domain/pointCoordinates'

export interface FindspotProperties {
  id: string
  name: string
  abbreviation: string
  parent: string | undefined
  geometryType: 'point' | 'polygon'
}

interface FindspotPoint {
  latitude: number
  longitude: number
}

function centroid(coordinates: readonly FindspotPoint[]): FindspotPoint {
  const sum = coordinates.reduce(
    (acc, c) => ({ lat: acc.lat + c.latitude, lng: acc.lng + c.longitude }),
    { lat: 0, lng: 0 },
  )
  return {
    latitude: sum.lat / coordinates.length,
    longitude: sum.lng / coordinates.length,
  }
}

function toFindspotLocation(provenance: ProvenanceRecord): {
  point: FindspotPoint
  geometryType: FindspotProperties['geometryType']
} | null {
  const provenanceGeometry = getProvenanceGeometry(provenance)
  if (!provenanceGeometry) return null

  const point =
    provenanceGeometry.type === 'point'
      ? provenanceGeometry.coordinates
      : centroid(provenanceGeometry.coordinates)

  return isValidPointCoordinate(point.longitude, point.latitude)
    ? { point, geometryType: provenanceGeometry.type }
    : null
}

export function provenanceToGeoJson(
  provenances: readonly ProvenanceRecord[],
): FeatureCollection<Point, FindspotProperties> {
  const features = provenances
    .map((provenance) => {
      const location = toFindspotLocation(provenance)
      if (!location) return null

      return {
        type: 'Feature' as const,
        id: provenance.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [location.point.longitude, location.point.latitude] as [
            number,
            number,
          ],
        },
        properties: {
          id: provenance.id,
          name: provenance.longName,
          abbreviation: provenance.abbreviation,
          parent: provenance.parent ?? undefined,
          geometryType: location.geometryType,
        },
      }
    })
    .filter(
      (feature): feature is NonNullable<typeof feature> => feature !== null,
    )

  return {
    type: 'FeatureCollection',
    features,
  }
}
