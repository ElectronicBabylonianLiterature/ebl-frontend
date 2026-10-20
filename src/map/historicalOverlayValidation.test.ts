import { validateHistoricalMapOverlay } from 'map/historicalOverlays'
import makeOverlay from 'test-support/historicalOverlayFixture'

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
