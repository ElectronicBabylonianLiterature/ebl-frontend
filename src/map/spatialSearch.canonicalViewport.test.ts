import fs from 'fs'
import path from 'path'
import type { FeatureCollection } from 'geojson'
import { buildExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { BoundingBox } from 'map/mapGeometry'
import { viewportSearchBounds } from 'map/spatialBounds'
import { runSpatialSearch } from 'map/spatialSearch'

const collection: FeatureCollection = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'public/map-data/findspots/all.geojson'),
    'utf8',
  ),
)
const index = buildExcavationPolygonIndex(collection)

it.each<BoundingBox>([
  [-90, -80, 90, 80],
  [-140, -80, 140, 80],
  [-180, -80, 180, 80],
  [180, -80, 540, 80],
])('finds every canonical excavation area in wide viewport %p', (...box) => {
  const result = runSpatialSearch(
    { type: 'viewport', bounds: viewportSearchBounds(...box) ?? [] },
    index,
    { summaries: new Map(), siteStatuses: new Map() },
  )

  expect(result.polygonIds).toHaveLength(collection.features.length)
  expect(new Set(result.polygonIds)).toEqual(
    new Set(collection.features.map(({ id }) => id)),
  )
  expect(result.unavailablePolygonCount).toBe(collection.features.length)
})
