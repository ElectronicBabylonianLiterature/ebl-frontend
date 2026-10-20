import { validateHistoricalMapOverlays } from 'map/historicalOverlays'
import makeOverlay from 'test-support/historicalOverlayFixture'

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
