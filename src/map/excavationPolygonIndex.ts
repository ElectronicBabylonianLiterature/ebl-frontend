import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { type BoundingBox, boundingBoxOfGeometry } from './mapGeometry'
import { geodesicAreaSquareKm } from './geodesicArea'

export const EXCAVATION_POLYGON_GEOJSON_URL = '/map-data/findspots/all.geojson'

export interface ExcavationPolygon {
  readonly polygonId: string
  readonly siteId: string
  readonly name: string | null
  readonly bounds: BoundingBox | null
  readonly areaSquareKm: number | null
  readonly geometry: Geometry
}

export type ExcavationPolygonIndex = ReadonlyMap<
  string,
  readonly ExcavationPolygon[]
>

function propertyString(
  feature: Feature<Geometry, Record<string, unknown> | null>,
  key: string,
): string | null {
  const value = feature.properties?.[key]
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function toExcavationPolygon(
  feature: Feature<Geometry, Record<string, unknown> | null>,
): ExcavationPolygon | null {
  const polygonId = propertyString(feature, 'id')
  const siteId = propertyString(feature, 'siteId')

  return polygonId && siteId && feature.id === polygonId
    ? {
        polygonId,
        siteId,
        name: propertyString(feature, 'name'),
        bounds: boundingBoxOfGeometry(feature.geometry),
        areaSquareKm: geodesicAreaSquareKm(feature.geometry),
        geometry: feature.geometry,
      }
    : null
}

export function buildExcavationPolygonIndex(
  collection: unknown,
): ExcavationPolygonIndex {
  const features = (collection as FeatureCollection | undefined)?.features
  if (!Array.isArray(features)) return new Map()

  const index = new Map<string, ExcavationPolygon[]>()
  const seenPolygonIds = new Set<string>()

  for (const feature of features) {
    const polygon = toExcavationPolygon(feature)
    if (!polygon || seenPolygonIds.has(polygon.polygonId)) continue

    seenPolygonIds.add(polygon.polygonId)
    index.set(polygon.siteId, [...(index.get(polygon.siteId) ?? []), polygon])
  }

  return index
}

export async function fetchExcavationPolygonIndex(): Promise<ExcavationPolygonIndex> {
  const response = await fetch(EXCAVATION_POLYGON_GEOJSON_URL)
  if (!response.ok) {
    throw new Error(
      `Excavation polygon assets unavailable (${response.status})`,
    )
  }

  return buildExcavationPolygonIndex(await response.json())
}
