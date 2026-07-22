import type { FeatureCollection, Point } from 'geojson'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry as getProvenanceGeometry,
} from 'fragmentarium/domain/Provenance'

function centroid(
  coordinates: readonly {
    readonly latitude: number
    readonly longitude: number
  }[],
): { latitude: number; longitude: number } {
  const sum = coordinates.reduce(
    (acc, c) => ({ lat: acc.lat + c.latitude, lng: acc.lng + c.longitude }),
    { lat: 0, lng: 0 },
  )
  return {
    latitude: sum.lat / coordinates.length,
    longitude: sum.lng / coordinates.length,
  }
}

export interface FindspotProperties {
  id: string
  name: string
  abbreviation: string
  parent: string | undefined
  geometryType: 'point' | 'polygon'
}

export function provenanceToGeoJson(
  provenances: readonly ProvenanceRecord[],
): FeatureCollection<Point, FindspotProperties> {
  const features = provenances
    .map((provenance) => {
      const provenanceGeometry = getProvenanceGeometry(provenance)
      if (!provenanceGeometry) return null

      let point: { latitude: number; longitude: number }
      if (provenanceGeometry.type === 'point') {
        point = provenanceGeometry.coordinates
      } else {
        point = centroid(provenanceGeometry.coordinates)
      }

      return {
        type: 'Feature' as const,
        id: provenance.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [point.longitude, point.latitude] as [number, number],
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
