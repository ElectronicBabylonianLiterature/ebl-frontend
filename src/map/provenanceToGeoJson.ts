import type { FeatureCollection, Point } from 'geojson'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry as getProvenanceGeometry,
} from 'fragmentarium/domain/Provenance'
import { type GeographicPoint, centroidOf } from './mapGeometry'

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

      const point: GeographicPoint | null =
        provenanceGeometry.type === 'point'
          ? provenanceGeometry.coordinates
          : centroidOf(provenanceGeometry.coordinates)
      if (!point) return null

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
