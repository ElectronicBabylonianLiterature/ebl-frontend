import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { type BoundingBox, boundingBoxOfGeometry } from 'map/mapGeometry'
import { geodesicAreaSquareKm } from 'map/geodesicArea'
import {
  MAP_SITE_IDS,
  MAP_SITE_POLYGON_COUNTS,
  isMapSiteId,
} from 'map/mapSites'

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
  const geometry = feature.geometry
  const hasPolygonGeometry =
    geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon'

  return polygonId &&
    isMapSiteId(siteId) &&
    feature.id === polygonId &&
    hasPolygonGeometry
    ? {
        polygonId,
        siteId,
        name: propertyString(feature, 'name'),
        bounds: boundingBoxOfGeometry(geometry),
        areaSquareKm: geodesicAreaSquareKm(geometry),
        geometry,
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
    if (!feature || typeof feature !== 'object') continue
    const polygon = toExcavationPolygon(feature)
    if (!polygon || seenPolygonIds.has(polygon.polygonId)) continue

    seenPolygonIds.add(polygon.polygonId)
    index.set(polygon.siteId, [...(index.get(polygon.siteId) ?? []), polygon])
  }

  return index
}

function validateCanonicalCollection(
  collection: unknown,
  index: ExcavationPolygonIndex,
): void {
  const candidate = collection as Partial<FeatureCollection> | null
  const expectedTotal = MAP_SITE_IDS.reduce(
    (total, siteId) => total + MAP_SITE_POLYGON_COUNTS[siteId],
    0,
  )
  if (
    candidate?.type !== 'FeatureCollection' ||
    !Array.isArray(candidate.features) ||
    candidate.features.length !== expectedTotal
  ) {
    throw new Error('Excavation polygon asset has an invalid collection shape')
  }

  for (const siteId of MAP_SITE_IDS) {
    const polygons = index.get(siteId) ?? []
    if (
      polygons.length !== MAP_SITE_POLYGON_COUNTS[siteId] ||
      polygons.some(
        (polygon) =>
          polygon.name === null ||
          polygon.bounds === null ||
          polygon.areaSquareKm === null,
      )
    ) {
      throw new Error(`Excavation polygon asset is invalid for ${siteId}`)
    }
  }
}

export async function fetchExcavationPolygonIndex(): Promise<ExcavationPolygonIndex> {
  const response = await fetch(EXCAVATION_POLYGON_GEOJSON_URL)
  if (!response.ok) {
    throw new Error(
      `Excavation polygon assets unavailable (${response.status})`,
    )
  }

  const collection: unknown = await response.json()
  const index = buildExcavationPolygonIndex(collection)
  validateCanonicalCollection(collection, index)
  return index
}
