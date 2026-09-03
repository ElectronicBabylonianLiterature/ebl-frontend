import {
  AWS_TERRAIN_TILES,
  TERRAIN_ATTRIBUTION,
  TERRAIN_PRECISION_NOTE,
  type TerrainSourceDefinition,
  approvedTerrainSource,
  isTerrainSourceApproved,
  validateTerrainSource,
} from './mapTerrainSource'

function withSource(
  overrides: Partial<TerrainSourceDefinition>,
): TerrainSourceDefinition {
  return { ...AWS_TERRAIN_TILES, ...overrides }
}

describe('the approved AWS terrain source', () => {
  it('passes every rights and transport gate', () => {
    expect(validateTerrainSource(AWS_TERRAIN_TILES)).toEqual([])
    expect(isTerrainSourceApproved(AWS_TERRAIN_TILES)).toBe(true)
    expect(approvedTerrainSource()).toBe(AWS_TERRAIN_TILES)
  })

  it('carries the verbatim USGS attribution and an https licence url', () => {
    expect(AWS_TERRAIN_TILES.attribution).toBe(TERRAIN_ATTRIBUTION)
    expect(TERRAIN_ATTRIBUTION).toContain(
      'courtesy of the U.S. Geological Survey',
    )
    expect(AWS_TERRAIN_TILES.licenceUrl).toMatch(/^https:\/\//)
    expect(AWS_TERRAIN_TILES.registryUrl).toMatch(/^https:\/\//)
  })

  it('uses terrarium encoding within the published zoom range', () => {
    expect(AWS_TERRAIN_TILES.encoding).toBe('terrarium')
    expect(AWS_TERRAIN_TILES.maxZoom).toBe(15)
    expect(AWS_TERRAIN_TILES.minZoom).toBe(0)
  })

  it('never claims to describe ancient ground level', () => {
    expect(TERRAIN_PRECISION_NOTE).toContain('Modern elevation model')
    expect(TERRAIN_PRECISION_NOTE).toContain('not ancient ground level')
  })
})

describe('validateTerrainSource', () => {
  it('rejects a blank attribution', () => {
    expect(validateTerrainSource(withSource({ attribution: '   ' }))).toEqual([
      { field: 'attribution', message: 'Attribution is required.' },
    ])
  })

  it('rejects a non-https licence url', () => {
    expect(
      validateTerrainSource(withSource({ licenceUrl: 'http://example.test' })),
    ).toContainEqual({
      field: 'licenceUrl',
      message: 'Licence URL is required.',
    })
  })

  it('rejects a malformed licence url', () => {
    expect(
      validateTerrainSource(withSource({ licenceUrl: 'not a url' })),
    ).toContainEqual({
      field: 'licenceUrl',
      message: 'Licence URL is required.',
    })
  })

  it('rejects an empty tile list', () => {
    expect(validateTerrainSource(withSource({ tiles: [] }))).toEqual([
      { field: 'tiles', message: 'No tile template is configured.' },
    ])
  })

  it('rejects a non-https tile template', () => {
    const errors = validateTerrainSource(
      withSource({ tiles: ['http://example.test/{z}/{x}/{y}.png'] }),
    )
    expect(errors).toContainEqual({
      field: 'tiles',
      message: 'Tile URL is not HTTPS: http://example.test/{z}/{x}/{y}.png',
    })
  })

  it('rejects a tile template that is not a url at all', () => {
    expect(
      validateTerrainSource(withSource({ tiles: ['/{z}/{x}/{y}.png'] })),
    ).toContainEqual({
      field: 'tiles',
      message: 'Tile URL is not HTTPS: /{z}/{x}/{y}.png',
    })
  })

  it.each([
    'https://dem.test/{z}/{x}/{y}.png?access_token=abc',
    'https://dem.test/{z}/{x}/{y}.png?api_key=abc',
    'https://dem.test/{z}/{x}/{y}.png?apikey=abc',
    'https://dem.test/{key}/{z}/{x}/{y}.png',
    'https://dem.test/{z}/{x}/{y}.png?token=abc',
  ])('rejects a tile template requiring a credential: %s', (template) => {
    expect(
      validateTerrainSource(withSource({ tiles: [template] })),
    ).toContainEqual({
      field: 'tiles',
      message: `Tile URL requires a credential: ${template}`,
    })
  })

  it.each([
    ['inverted', 15, 2],
    ['equal', 5, 5],
    ['negative', -1, 15],
  ])('rejects an unusable %s zoom range', (_name, minZoom, maxZoom) => {
    expect(validateTerrainSource(withSource({ minZoom, maxZoom }))).toEqual([
      { field: 'maxZoom', message: 'Zoom range is not usable.' },
    ])
  })

  it('reports every failed gate at once', () => {
    const errors = validateTerrainSource(
      withSource({
        attribution: '',
        licenceUrl: 'ftp://example.test',
        tiles: ['http://dem.test/{z}/{x}/{y}.png?api_key=abc'],
        minZoom: 9,
        maxZoom: 1,
      }),
    )

    expect(errors.map((error) => error.field)).toEqual([
      'attribution',
      'licenceUrl',
      'tiles',
      'maxZoom',
    ])
    expect(isTerrainSourceApproved(withSource({ attribution: '' }))).toBe(false)
  })

  it('withholds a candidate that fails a gate', () => {
    expect(approvedTerrainSource(withSource({ attribution: '' }))).toBeNull()
  })
})
