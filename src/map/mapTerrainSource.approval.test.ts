import {
  AWS_TERRAIN_TILES,
  type TerrainSourceDefinition,
  isTerrainSourceApproved,
} from 'map/mapTerrainSource'

const CHANGED_SOURCE_FIELDS: readonly [
  string,
  Partial<TerrainSourceDefinition>,
][] = [
  ['identifier', { id: 'different-source' }],
  ['label', { label: 'Different elevation model' }],
  ['encoding', { encoding: 'mapbox' }],
  ['tile size', { tileSize: 512 }],
  ['minimum zoom', { minZoom: 1 }],
  ['maximum zoom', { maxZoom: 16 }],
  ['attribution', { attribution: 'Different provider' }],
  ['licence URL', { licenceUrl: 'https://example.test/licence' }],
  ['registry URL', { registryUrl: 'https://example.test/registry' }],
  ['verification date', { verifiedOn: '2026-08-06' }],
  ['empty tiles', { tiles: [] }],
  [
    'additional tile',
    { tiles: [...AWS_TERRAIN_TILES.tiles, ...AWS_TERRAIN_TILES.tiles] },
  ],
  ['different tile', { tiles: ['https://example.test/{z}/{x}/{y}.png'] }],
]

it.each(CHANGED_SOURCE_FIELDS)(
  'rejects a changed curated %s independently of every other source field',
  (_field, change) => {
    expect(isTerrainSourceApproved({ ...AWS_TERRAIN_TILES, ...change })).toBe(
      false,
    )
  },
)

it('approves an unchanged source without requiring object or tile-array identity', () => {
  expect(
    isTerrainSourceApproved({
      ...AWS_TERRAIN_TILES,
      tiles: [...AWS_TERRAIN_TILES.tiles],
    }),
  ).toBe(true)
})
