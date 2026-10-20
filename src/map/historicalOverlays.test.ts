import {
  historicalMapOverlays,
  isSafeOverlayUrl,
  validateHistoricalMapOverlay,
  validateHistoricalMapOverlays,
} from 'map/historicalOverlays'

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
