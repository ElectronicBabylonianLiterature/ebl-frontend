import {
  AWS_TERRAIN_TILES,
  type TerrainSourceDefinition,
  isTerrainSourceApproved,
  validateTerrainSource,
} from 'map/mapTerrainSource'

it.each<Partial<TerrainSourceDefinition>>([
  { encoding: 'mapbox' },
  { tileSize: 512 },
])('keeps valid uncurated formats separate from approval: %j', (change) => {
  const source = { ...AWS_TERRAIN_TILES, ...change }

  expect(validateTerrainSource(source)).toEqual([])
  expect(isTerrainSourceApproved(source)).toBe(false)
})

it.each([
  {
    change: { encoding: 'unsupported' as TerrainSourceDefinition['encoding'] },
    field: 'encoding',
  },
  { change: { tileSize: 128 }, field: 'tileSize' },
])('reports unsupported source formats: $field', ({ change, field }) => {
  expect(
    validateTerrainSource({ ...AWS_TERRAIN_TILES, ...change }),
  ).toContainEqual(expect.objectContaining({ field }))
})

it.each([
  'https://example.test/{x}/{y}.png',
  'https://example.test/{z}/{y}.png',
  'https://example.test/{z}/{x}.png',
])('rejects tile templates with missing coordinates: %s', (template) => {
  expect(
    validateTerrainSource({ ...AWS_TERRAIN_TILES, tiles: [template] }),
  ).toContainEqual({
    field: 'tiles',
    message: `Tile URL is missing z/x/y placeholders: ${template}`,
  })
})

it.each([
  'https://username@example.test/{z}/{x}/{y}.png',
  'https://:password@example.test/{z}/{x}/{y}.png',
])('rejects credentials in tile URL authority: %s', (template) => {
  expect(
    validateTerrainSource({ ...AWS_TERRAIN_TILES, tiles: [template] }),
  ).toContainEqual({
    field: 'tiles',
    message: `Tile URL is not credential-free HTTPS: ${template}`,
  })
})
