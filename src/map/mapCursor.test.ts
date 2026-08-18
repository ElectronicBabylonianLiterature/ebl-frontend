import {
  mockCanvas,
  mockMapInstance,
  mockQueryRenderedFeatures,
  resetMapMocks,
} from 'map/testSupport/mapLibreMock'
import {
  resetPointerCursor,
  setCanvasCursor,
  setPointerCursor,
  showPointerCursor,
} from 'map/mapCursor'

jest.mock('maplibre-gl')

describe('map cursor helpers', () => {
  beforeEach(resetMapMocks)

  it('sets a pointer cursor when entering an interactive feature', () => {
    showPointerCursor(mockMapInstance as never)

    expect(mockCanvas).toHaveStyle({ cursor: 'pointer' })
  })

  it('sets the pointer cursor while moving over interactive features', () => {
    mockQueryRenderedFeatures.mockReturnValue([{}])

    setPointerCursor(
      mockMapInstance as never,
      { point: { x: 1, y: 2 } } as never,
    )

    expect(mockCanvas).toHaveStyle({ cursor: 'pointer' })
    expect(mockQueryRenderedFeatures).toHaveBeenCalledWith(
      { x: 1, y: 2 },
      { layers: ['ebl-clusters', 'ebl-unclustered-points'] },
    )
  })

  it('resets to the default cursor when leaving interactive features', () => {
    mockCanvas.style.cursor = 'pointer'

    resetPointerCursor(mockMapInstance as never)

    expect(mockCanvas).toHaveStyle({ cursor: '' })
  })

  it('resets to the default cursor while moving away from interactive features', () => {
    mockCanvas.style.cursor = 'pointer'
    mockQueryRenderedFeatures.mockReturnValue([])

    setPointerCursor(
      mockMapInstance as never,
      { point: { x: 1, y: 2 } } as never,
    )

    expect(mockCanvas).toHaveStyle({ cursor: '' })
  })

  it('ignores a canvas without a style object', () => {
    expect(() => {
      setCanvasCursor({ getCanvas: () => ({}) } as never, 'pointer')
    }).not.toThrow()
  })
})
