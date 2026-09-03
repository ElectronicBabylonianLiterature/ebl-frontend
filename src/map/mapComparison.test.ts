import {
  type ComparisonState,
  DEFAULT_COMPARISON_STATE,
  DEFAULT_BLEND_POSITION,
  clampBlendPosition,
  comparisonOverlays,
  isComparisonReady,
  sideLabel,
  withMode,
  withSide,
  withSolo,
  withBlendPosition,
} from './mapComparison'

function state(overrides: Partial<ComparisonState> = {}): ComparisonState {
  return {
    ...DEFAULT_COMPARISON_STATE,
    mode: 'opacity',
    leftOverlayId: null,
    rightOverlayId: 'overlay-b',
    ...overrides,
  }
}

describe('clampBlendPosition', () => {
  it.each([
    [0.25, 0.25],
    [-1, 0],
    [4, 1],
    [Number.NaN, DEFAULT_BLEND_POSITION],
  ])('clamps %s to %s', (input, expected) => {
    expect(clampBlendPosition(input)).toBe(expected)
  })
})

describe('isComparisonReady', () => {
  it('is false while comparison is off', () => {
    expect(isComparisonReady(state({ mode: 'off' }))).toBe(false)
  })

  it('is false when both sides show the same thing', () => {
    expect(
      isComparisonReady(
        state({ leftOverlayId: 'overlay-a', rightOverlayId: 'overlay-a' }),
      ),
    ).toBe(false)
  })

  it('is true when the base map is compared against an overlay', () => {
    expect(isComparisonReady(state())).toBe(true)
  })
})

describe('sideLabel', () => {
  it('names the base map and the overlay side explicitly', () => {
    expect(sideLabel(state(), 'left')).toBe('Left: base map')
    expect(sideLabel(state(), 'right')).toBe('Right: historical overlay')
  })

  it('names a left overlay too', () => {
    expect(sideLabel(state({ leftOverlayId: 'overlay-a' }), 'left')).toBe(
      'Left: historical overlay',
    )
  })
})

describe('comparisonOverlays', () => {
  it('is empty when the comparison is not ready', () => {
    expect(comparisonOverlays(state({ mode: 'off' }))).toEqual([])
  })

  it('cross-fades both sides in opacity mode', () => {
    expect(
      comparisonOverlays(
        state({
          leftOverlayId: 'overlay-a',
          rightOverlayId: 'overlay-b',
          blendPosition: 0.25,
        }),
      ),
    ).toEqual([
      { id: 'overlay-a', opacity: 0.75, visible: true },
      { id: 'overlay-b', opacity: 0.25, visible: true },
    ])
  })

  it('omits a side that has faded to nothing', () => {
    expect(
      comparisonOverlays(
        state({
          leftOverlayId: 'overlay-a',
          rightOverlayId: 'overlay-b',
          blendPosition: 0,
        }),
      ),
    ).toEqual([{ id: 'overlay-a', opacity: 1, visible: true }])
  })

  it('shows only the soloed side at full opacity', () => {
    expect(
      comparisonOverlays(
        state({
          leftOverlayId: 'overlay-a',
          rightOverlayId: 'overlay-b',
          soloSide: 'right',
        }),
      ),
    ).toEqual([{ id: 'overlay-b', opacity: 1, visible: true }])
  })

  it('omits the base-map side rather than emitting a null overlay', () => {
    expect(
      comparisonOverlays(state({ leftOverlayId: null, blendPosition: 0.25 })),
    ).toEqual([{ id: 'overlay-b', opacity: 0.25, visible: true }])
  })
})

describe('comparison transitions', () => {
  it('clamps a blend position when it is set', () => {
    expect(withBlendPosition(state(), 9).blendPosition).toBe(1)
  })

  it('toggles solo off when the same side is chosen twice', () => {
    const soloed = withSolo(state(), 'left')

    expect(soloed.soloSide).toBe('left')
    expect(withSolo(soloed, 'left').soloSide).toBeNull()
    expect(withSolo(soloed, 'right').soloSide).toBe('right')
  })

  it('assigns each side independently', () => {
    expect(withSide(state(), 'left', 'overlay-a').leftOverlayId).toBe(
      'overlay-a',
    )
    expect(withSide(state(), 'right', null).rightOverlayId).toBeNull()
  })

  it('resets everything when comparison is switched off', () => {
    expect(withMode(state({ soloSide: 'left' }), 'off')).toEqual(
      DEFAULT_COMPARISON_STATE,
    )
  })

  it('clears solo when comparison is re-entered', () => {
    expect(withMode(state({ soloSide: 'left' }), 'opacity')).toMatchObject({
      mode: 'opacity',
      soloSide: null,
    })
  })
})
