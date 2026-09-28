import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type {
  ExcavationPolygon,
  ExcavationPolygonIndex,
} from 'map/excavationPolygonIndex'
import type { BoundingBox } from 'map/mapGeometry'
import { geometryIntersectsBoundingBox } from 'map/spatialPredicates'

export type SpatialSearchShape =
  | { readonly type: 'viewport'; readonly bounds: readonly BoundingBox[] }
  | { readonly type: 'bounding-box'; readonly bounds: readonly BoundingBox[] }

export type SpatialSearchDataStatus = 'available' | 'loading' | 'unavailable'

export interface SpatialSearchData {
  readonly summaries: ReadonlyMap<string, PolygonFindspotSummary>
  readonly siteStatuses: ReadonlyMap<string, SpatialSearchDataStatus>
}

export interface SpatialSearchResult {
  readonly polygonIds: readonly string[]
  readonly findspotIds: readonly number[]
  readonly mappedPolygonCount: number
  readonly accessibleFragmentCount: number
  readonly availablePolygonCount: number
  readonly loadingPolygonCount: number
  readonly unavailablePolygonCount: number
}

export const EMPTY_SPATIAL_SEARCH_RESULT: SpatialSearchResult = {
  polygonIds: [],
  findspotIds: [],
  mappedPolygonCount: 0,
  accessibleFragmentCount: 0,
  availablePolygonCount: 0,
  loadingPolygonCount: 0,
  unavailablePolygonCount: 0,
}

function allPolygons(
  index: ExcavationPolygonIndex,
): readonly ExcavationPolygon[] {
  return [...index.values()].flat()
}

function isValidBounds([west, south, east, north]: BoundingBox): boolean {
  return (
    [west, south, east, north].every(Number.isFinite) &&
    west >= -180 &&
    east <= 180 &&
    south >= -90 &&
    north <= 90 &&
    west < east &&
    south < north
  )
}

function matchingPolygons(
  index: ExcavationPolygonIndex,
  bounds: readonly BoundingBox[],
): readonly ExcavationPolygon[] {
  const byId = new Map(
    allPolygons(index)
      .filter((polygon) =>
        bounds.some((box) =>
          geometryIntersectsBoundingBox(polygon.geometry, box),
        ),
      )
      .map((polygon) => [polygon.polygonId, polygon]),
  )
  return [...byId.values()].sort((left, right) =>
    left.polygonId.localeCompare(right.polygonId),
  )
}

interface FindspotMatch {
  readonly accessibleFragmentCount: number
}

function addFindspots(
  summary: PolygonFindspotSummary,
  matches: Map<number, FindspotMatch>,
  rejected: Set<number>,
): void {
  for (const findspot of summary.findspots) {
    const id = findspot.findspotId
    if (rejected.has(id)) continue

    const existing = matches.get(id)
    if (
      existing &&
      existing.accessibleFragmentCount !== findspot.accessibleFragmentCount
    ) {
      matches.delete(id)
      rejected.add(id)
    } else if (!existing) {
      matches.set(id, {
        accessibleFragmentCount: findspot.accessibleFragmentCount,
      })
    }
  }
}

export function runSpatialSearch(
  shape: SpatialSearchShape,
  index: ExcavationPolygonIndex,
  data: SpatialSearchData,
): SpatialSearchResult {
  if (
    shape.bounds.length === 0 ||
    shape.bounds.length > 2 ||
    !shape.bounds.every(isValidBounds)
  ) {
    return EMPTY_SPATIAL_SEARCH_RESULT
  }

  const polygons = matchingPolygons(index, shape.bounds)
  const matches = new Map<number, FindspotMatch>()
  const rejected = new Set<number>()
  let mappedPolygonCount = 0
  let availablePolygonCount = 0
  let loadingPolygonCount = 0
  let unavailablePolygonCount = 0

  for (const polygon of polygons) {
    const status = data.siteStatuses.get(polygon.siteId) ?? 'unavailable'
    if (status === 'loading') {
      loadingPolygonCount += 1
      continue
    }
    if (status === 'unavailable') {
      unavailablePolygonCount += 1
      continue
    }

    availablePolygonCount += 1
    const summary = data.summaries.get(polygon.polygonId)
    if (!summary) continue
    mappedPolygonCount += 1
    addFindspots(summary, matches, rejected)
  }

  return {
    polygonIds: polygons.map(({ polygonId }) => polygonId),
    findspotIds: [...matches.keys()].sort((left, right) => left - right),
    mappedPolygonCount,
    accessibleFragmentCount: [...matches.values()].reduce(
      (total, match) => total + match.accessibleFragmentCount,
      0,
    ),
    availablePolygonCount,
    loadingPolygonCount,
    unavailablePolygonCount,
  }
}

export function spatialSearchDescription(shape: SpatialSearchShape): string {
  return shape.type === 'viewport' ? 'Current map view' : 'Drawn rectangle'
}
