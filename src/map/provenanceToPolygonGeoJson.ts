import type { FeatureCollection, Polygon } from 'geojson'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry as getSpatialProvenanceGeometry,
} from 'fragmentarium/domain/Provenance'
import type { FindspotProperties } from './provenanceToGeoJson'

type PolygonVertex = {
  readonly latitude: number
  readonly longitude: number
}
type RingCoordinate = [number, number]

function isClosedRing(coordinates: readonly PolygonVertex[]): boolean {
  const first = coordinates[0]
  const last = coordinates[coordinates.length - 1]

  return first.latitude === last.latitude && first.longitude === last.longitude
}

function toClosedRing(coordinates: readonly PolygonVertex[]): RingCoordinate[] {
  const ring = coordinates.map(
    ({ latitude, longitude }): RingCoordinate => [longitude, latitude],
  )

  if (!isClosedRing(coordinates)) {
    const first = coordinates[0]
    ring.push([first.longitude, first.latitude])
  }

  return ring
}

export function provenancesToPolygonGeoJson(
  provenances: readonly ProvenanceRecord[],
): FeatureCollection<Polygon, FindspotProperties> {
  const features = provenances
    .map((provenance) => {
      const provenanceGeometry = getSpatialProvenanceGeometry(provenance)
      if (!provenanceGeometry || provenanceGeometry.type !== 'polygon') {
        return null
      }

      return {
        type: 'Feature' as const,
        id: provenance.id,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [toClosedRing(provenanceGeometry.coordinates)],
        },
        properties: {
          id: provenance.id,
          name: provenance.longName,
          abbreviation: provenance.abbreviation,
          parent: provenance.parent ?? undefined,
          geometryType: provenanceGeometry.type,
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
