import type { Position } from 'geojson'
import type { PolygonFindspotSummary } from './findspotMapData'
import type {
  ExcavationPolygon,
  ExcavationPolygonIndex,
} from './excavationPolygonIndex'
import { type BoundingBox, boundingBoxOfPositions } from './mapGeometry'
import {
  type Ring,
  boundingBoxesIntersect,
  boundingBoxRing,
  geometryIntersectsRing,
} from './spatialPredicates'

export type SpatialSearchShape =
  | { readonly type: 'viewport'; readonly bounds: BoundingBox }
  | { readonly type: 'bounding-box'; readonly bounds: BoundingBox }
  | { readonly type: 'polygon'; readonly positions: readonly Position[] }
  | { readonly type: 'excavation-area'; readonly polygonId: string }

export interface SpatialSearchResult {
  readonly polygonIds: readonly string[]
  readonly findspotIds: readonly number[]
  readonly mappedPolygonCount: number
  readonly accessibleFragmentCount: number
}

export const EMPTY_SPATIAL_SEARCH_RESULT: SpatialSearchResult = {
  polygonIds: [],
  findspotIds: [],
  mappedPolygonCount: 0,
  accessibleFragmentCount: 0,
}

function allPolygons(
  index: ExcavationPolygonIndex,
): readonly ExcavationPolygon[] {
  return [...index.values()].flat()
}

function closeRing(positions: readonly Position[]): Ring | null {
  if (positions.length < 3) return null

  const [first] = positions
  const last = positions[positions.length - 1]
  return first[0] === last[0] && first[1] === last[1]
    ? positions
    : [...positions, first]
}

function searchRingOf(
  shape: SpatialSearchShape,
  index: ExcavationPolygonIndex,
): Ring | null {
  switch (shape.type) {
    case 'viewport':
    case 'bounding-box':
      return boundingBoxRing(shape.bounds)
    case 'polygon':
      return closeRing(shape.positions)
    default: {
      const polygon = allPolygons(index).find(
        (entry) => entry.polygonId === shape.polygonId,
      )
      return polygon?.bounds ? boundingBoxRing(polygon.bounds) : null
    }
  }
}

function matchingPolygons(
  index: ExcavationPolygonIndex,
  searchRing: Ring,
): readonly ExcavationPolygon[] {
  const searchBounds = boundingBoxOfPositions(
    searchRing.map(([longitude, latitude]) => [longitude, latitude] as const),
  )
  if (searchBounds === null) return []

  return allPolygons(index).filter(
    (polygon) =>
      polygon.bounds !== null &&
      boundingBoxesIntersect(polygon.bounds, searchBounds) &&
      geometryIntersectsRing(polygon.geometry, searchRing),
  )
}

export function runSpatialSearch(
  shape: SpatialSearchShape,
  index: ExcavationPolygonIndex,
  summaries: ReadonlyMap<string, PolygonFindspotSummary>,
): SpatialSearchResult {
  const searchRing = searchRingOf(shape, index)
  if (searchRing === null) return EMPTY_SPATIAL_SEARCH_RESULT

  const polygons = matchingPolygons(index, searchRing)
  const findspotIds = new Set<number>()
  let mappedPolygonCount = 0
  let accessibleFragmentCount = 0

  for (const polygon of polygons) {
    const summary = summaries.get(polygon.polygonId)
    if (!summary) continue

    mappedPolygonCount += 1
    accessibleFragmentCount += summary.accessibleFragmentCount
    for (const findspotId of summary.findspotIds) {
      findspotIds.add(findspotId)
    }
  }

  return {
    polygonIds: polygons
      .map((polygon) => polygon.polygonId)
      .sort((left, right) => left.localeCompare(right)),
    findspotIds: [...findspotIds].sort((left, right) => left - right),
    mappedPolygonCount,
    accessibleFragmentCount,
  }
}

export function spatialSearchDescription(shape: SpatialSearchShape): string {
  switch (shape.type) {
    case 'viewport':
      return 'Current map view'
    case 'bounding-box':
      return 'Drawn rectangle'
    case 'polygon':
      return 'Drawn area'
    default:
      return 'Selected excavation area'
  }
}
