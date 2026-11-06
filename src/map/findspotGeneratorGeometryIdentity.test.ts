import path from 'path'
import type { FeatureCollection, Polygon } from 'geojson'
import {
  type InventoryRecord,
  type MappingRecord,
  artifactPath,
  makeWorkDir,
  outputHashes,
  readJson,
  runGenerator,
  writeJson,
} from 'map/findspotGeneratorTestSupport'

const BACKEND_GEOMETRY_CHECKSUM = 'aa21affafa5e'
const POLYGON_ID = `kalhu-area-1-${BACKEND_GEOMETRY_CHECKSUM}`
const EXTERIOR = [
  [9, 0],
  [13, 0],
  [13, 5],
  [9, 5],
  [9, 0],
]
const FIRST_HOLE = [
  [10, 1],
  [11, 1],
  [11, 2],
  [10, 2],
  [10, 1],
]
const SECOND_HOLE = [
  [11.5, 3],
  [12.5, 3],
  [12.5, 4],
  [11.5, 4],
  [11.5, 3],
]

function preparePolygon(rings: Polygon['coordinates']): string {
  const directory = makeWorkDir()
  const file = path.join(directory, 'kalhu.geojson')
  const collection = readJson<FeatureCollection<Polygon>>(file)
  collection.features[0].geometry.coordinates = rings
  writeJson(file, collection)
  const inventoryFile = artifactPath(directory, 'kalhu', 'polygon_inventory')
  const inventory = readJson<InventoryRecord[]>(inventoryFile)
  inventory[0].polygonId = POLYGON_ID
  inventory[0].geometryChecksum = BACKEND_GEOMETRY_CHECKSUM
  writeJson(inventoryFile, inventory)
  const mappingFile = artifactPath(
    directory,
    'kalhu',
    'findspot_polygon_mappings',
  )
  const mappings = readJson<MappingRecord[]>(mappingFile)
  mappings[0].polygonIds = [POLYGON_ID]
  writeJson(mappingFile, mappings)
  return directory
}

it.each([
  [EXTERIOR, FIRST_HOLE, SECOND_HOLE],
  [EXTERIOR, SECOND_HOLE, FIRST_HOLE],
  [EXTERIOR, [...FIRST_HOLE].reverse(), [...SECOND_HOLE].reverse()],
])(
  'matches backend geometry identity with holes for variant %#',
  (...rings) => {
    const directory = preparePolygon(rings)

    runGenerator(directory)

    const collection = readJson<FeatureCollection<Polygon>>(
      path.join(directory, 'kalhu.geojson'),
    )
    expect(collection.features[0].id).toBe(POLYGON_ID)
    expect(collection.features[0].geometry.coordinates).toEqual(rings)
  },
)

test('rejects changing a polygon exterior into a hole without replacing outputs', () => {
  const directory = preparePolygon([FIRST_HOLE, EXTERIOR, SECOND_HOLE])
  const before = outputHashes(directory)

  expect(() => runGenerator(directory)).toThrow()
  expect(outputHashes(directory)).toEqual(before)
})
