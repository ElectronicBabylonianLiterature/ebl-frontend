import type { HistoricalMapOverlay } from './historicalOverlays'
import {
  historicalMapOverlays,
  isSafeOverlayUrl,
  validateHistoricalMapOverlay,
  validateHistoricalMapOverlays,
} from './historicalOverlays'

function makeOverlay(
  overrides: Partial<HistoricalMapOverlay> = {},
): HistoricalMapOverlay {
  return {
    id: 'babylon-map',
    siteId: 'babylon',
    siteName: 'Babylon',
    title: 'Babylon Map',
    shortTitle: 'Babylon',
    dateLabel: 'c. 600 BCE',
    description: 'A historical map of Babylon',
    cartographer: 'Unknown',
    institution: 'British Museum',
    sourceFilename: 'babylon.tif',
    attribution: 'British Museum, 1900',
    sourceUrl: 'https://example.com/babylon',
    type: 'raster-tiles',
    tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
    bounds: [44.0, 32.0, 45.0, 33.0],
    minZoom: 5,
    maxZoom: 15,
    tileSize: 256,
    defaultOpacity: 0.8,
    ...overrides,
  }
}

describe('isSafeOverlayUrl', () => {
  it('accepts an HTTPS URL', () => {
    expect(isSafeOverlayUrl('https://example.com/tiles/{z}/{x}/{y}.png')).toBe(
      true,
    )
  })

  it('accepts an HTTP URL', () => {
    expect(isSafeOverlayUrl('http://example.com/tiles/{z}/{x}/{y}.png')).toBe(
      true,
    )
  })

  it('accepts a relative tile URL', () => {
    expect(isSafeOverlayUrl('/tiles/{z}/{x}/{y}.png')).toBe(true)
  })

  it('rejects a javascript: URL', () => {
    // eslint-disable-next-line no-script-url
    expect(isSafeOverlayUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects a data: URL', () => {
    expect(isSafeOverlayUrl('data:text/html,<script>alert(1)</script>')).toBe(
      false,
    )
  })

  it('rejects a file: URL', () => {
    expect(isSafeOverlayUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isSafeOverlayUrl('')).toBe(false)
  })

  it('rejects a whitespace-only string', () => {
    expect(isSafeOverlayUrl('   ')).toBe(false)
  })
})

describe('validateHistoricalMapOverlay', () => {
  it('accepts a fully valid overlay', () => {
    expect(validateHistoricalMapOverlay(makeOverlay())).toHaveLength(0)
  })

  it('accepts an overlay with relative tile URL', () => {
    expect(
      validateHistoricalMapOverlay(
        makeOverlay({ tiles: ['/tiles/{z}/{x}/{y}.png'] }),
      ),
    ).toHaveLength(0)
  })

  it('accepts an overlay with HTTPS source URL', () => {
    expect(
      validateHistoricalMapOverlay(
        makeOverlay({ sourceUrl: 'https://example.com/source' }),
      ),
    ).toHaveLength(0)
  })

  it('rejects empty ID', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ id: '' }))
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('id')
  })

  it('rejects a malformed ID', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ id: 'Bad ID!' }))
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('id')
  })

  it('rejects an ID that starts with a hyphen', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ id: '-invalid' }))
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('id')
  })

  it('rejects empty title', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ title: '' }))
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('title')
  })

  it('rejects a whitespace-only title', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ title: '   ' }))
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('title')
  })

  it('rejects empty attribution', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ attribution: '' }),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('attribution')
  })

  it('rejects no tile URLs', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ tiles: [] }))
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('tiles')
  })

  it('rejects tiles with unsafe protocol', () => {
    /* eslint-disable no-script-url */
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ tiles: ['javascript:void(0)'] }),
    )
    /* eslint-enable no-script-url */
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('tiles')
  })

  it('rejects sourceUrl with unsafe protocol', () => {
    /* eslint-disable no-script-url */
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ sourceUrl: 'javascript:void(0)' }),
    )
    /* eslint-enable no-script-url */
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('sourceUrl')
  })

  it('rejects opacity below zero', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ defaultOpacity: -0.1 }),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('defaultOpacity')
  })

  it('rejects opacity above one', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ defaultOpacity: 1.1 }),
    )
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('defaultOpacity')
  })

  it('accepts opacity at zero', () => {
    expect(
      validateHistoricalMapOverlay(makeOverlay({ defaultOpacity: 0 })),
    ).toHaveLength(0)
  })

  it('accepts opacity at one', () => {
    expect(
      validateHistoricalMapOverlay(makeOverlay({ defaultOpacity: 1 })),
    ).toHaveLength(0)
  })

  it('rejects malformed bounds with wrong length', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({
        bounds: [1, 2, 3] as unknown as [number, number, number, number],
      }),
    )
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'bounds')).toBe(true)
  })

  it('rejects bounds with west >= east', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ bounds: [45, 32, 44, 33] }),
    )
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'bounds')).toBe(true)
  })

  it('rejects bounds with south >= north', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ bounds: [44, 33, 45, 32] }),
    )
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'bounds')).toBe(true)
  })

  it('rejects minZoom that is not a finite number', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ minZoom: NaN }))
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'minZoom')).toBe(true)
  })

  it('rejects maxZoom that is not a finite number', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ maxZoom: Infinity }),
    )
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'maxZoom')).toBe(true)
  })

  it('rejects minZoom greater than maxZoom', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ minZoom: 10, maxZoom: 5 }),
    )
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'minZoom')).toBe(true)
  })

  it('rejects invalid tileSize', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ tileSize: 0 }))
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'tileSize')).toBe(true)
  })

  it('rejects negative tileSize', () => {
    const errors = validateHistoricalMapOverlay(makeOverlay({ tileSize: -256 }))
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'tileSize')).toBe(true)
  })

  it('accepts overlay without optional bounds', () => {
    const overlay = makeOverlay()
    delete (overlay as { bounds?: unknown }).bounds
    expect(validateHistoricalMapOverlay(overlay)).toHaveLength(0)
  })

  it('accepts overlay without optional zoom values', () => {
    const overlay = makeOverlay()
    delete (overlay as { minZoom?: unknown }).minZoom
    delete (overlay as { maxZoom?: unknown }).maxZoom
    expect(validateHistoricalMapOverlay(overlay)).toHaveLength(0)
  })

  it('rejects invalid type', () => {
    const errors = validateHistoricalMapOverlay(
      makeOverlay({ type: 'geojson' as 'raster-tiles' }),
    )
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.field === 'type')).toBe(true)
  })
})

describe('validateHistoricalMapOverlays', () => {
  it('accepts an empty manifest', () => {
    expect(validateHistoricalMapOverlays([])).toHaveLength(0)
  })

  it('accepts a manifest with a single valid overlay', () => {
    expect(validateHistoricalMapOverlays([makeOverlay()])).toHaveLength(0)
  })

  it('accepts a manifest with multiple distinct overlays', () => {
    expect(
      validateHistoricalMapOverlays([
        makeOverlay({ id: 'map-a' }),
        makeOverlay({ id: 'map-b' }),
      ]),
    ).toHaveLength(0)
  })

  it('rejects duplicate IDs', () => {
    const errors = validateHistoricalMapOverlays([
      makeOverlay({ id: 'duplicate' }),
      makeOverlay({ id: 'duplicate' }),
    ])
    const duplicateErrors = errors.filter((e) => e.field === 'manifest')
    expect(duplicateErrors.length).toBeGreaterThan(0)
    expect(duplicateErrors[0].overlayId).toBe('duplicate')
  })

  it('reports both duplicate and validation errors', () => {
    const errors = validateHistoricalMapOverlays([
      makeOverlay({ id: 'dup', title: '' }),
      makeOverlay({ id: 'dup', title: '' }),
    ])
    expect(errors.length).toBeGreaterThan(1)
    expect(errors.some((e) => e.field === 'manifest')).toBe(true)
    expect(errors.some((e) => e.field === 'title')).toBe(true)
  })
})

describe('production manifest', () => {
  const assurOverlay = historicalMapOverlays.find(
    (o) => o.id === 'assur-andrae-1938-beilage',
  )

  it('contains assur-andrae-1938-beilage', () => {
    expect(assurOverlay).toBeDefined()
  })

  it('passes validation', () => {
    if (assurOverlay) {
      expect(validateHistoricalMapOverlay(assurOverlay)).toHaveLength(0)
    }
  })

  it('uses a relative tile URL', () => {
    expect(assurOverlay?.tiles[0]).toMatch(/^\/historical-maps\//)
    expect(isSafeOverlayUrl(assurOverlay?.tiles[0] ?? '')).toBe(true)
  })

  it('declares the expected EPSG:4326 bounds', () => {
    expect(assurOverlay?.bounds).toEqual([
      43.2507948, 35.4442168, 43.268817, 35.4629941,
    ])
  })

  it('declares a generated zoom range', () => {
    expect(assurOverlay?.minZoom).toBe(13)
    expect(assurOverlay?.maxZoom).toBe(18)
  })

  it('declares a valid default opacity', () => {
    expect(assurOverlay?.defaultOpacity).toBeGreaterThanOrEqual(0)
    expect(assurOverlay?.defaultOpacity).toBeLessThanOrEqual(1)
  })

  it('does not fabricate a sourceUrl', () => {
    expect(assurOverlay?.sourceUrl).toBeUndefined()
  })

  it('declares tile size 256', () => {
    expect(assurOverlay?.tileSize).toBe(256)
  })

  it('groups Nippur RN2747 plates as a series with unambiguous labels', () => {
    const rn2747 = historicalMapOverlays.filter(
      (overlay) => overlay.seriesId === 'nippur-rn2747',
    )

    expect(rn2747.map((overlay) => overlay.plateLabel)).toEqual([
      'Plate 5',
      'Plate 52',
      'Plate 54',
      'Plate 59',
      'Plate 61',
      'Plate 74A',
      'Plate 75A',
      'Plate 76A',
    ])
    expect(rn2747.every((overlay) => overlay.seriesTitle === 'RN 2747')).toBe(
      true,
    )
  })

  it('does not include raw or temporary map paths in production overlays', () => {
    for (const overlay of historicalMapOverlays) {
      expect(JSON.stringify(overlay)).not.toContain('/workspaces/')
      expect(JSON.stringify(overlay)).not.toContain('.map-processing')
      expect(overlay.tiles[0]).not.toMatch(/\.(tif|tiff)$/i)
    }
  })

  it('passes the full manifest validator', () => {
    expect(validateHistoricalMapOverlays(historicalMapOverlays)).toHaveLength(0)
  })
})
