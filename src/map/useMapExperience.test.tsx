import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, renderHook } from '@testing-library/react'
import useMapExperience from './useMapExperience'
import { DEFAULT_MAP_URL_STATE } from './mapUrlState'
import { historicalMapOverlay } from 'test-support/map-fixtures'

const overlayA = historicalMapOverlay({ id: 'overlay-a', defaultOpacity: 0.7 })
const overlayB = historicalMapOverlay({ id: 'overlay-b', defaultOpacity: 0.4 })
const series = {
  seriesId: 'rn2747',
  seriesTitle: 'RN 2747',
  overlays: [overlayA, overlayB],
}
const context = { knownOverlayIds: new Set(['overlay-a', 'overlay-b']) }

function mountExperience(initialEntry = '/') {
  return renderHook(() => useMapExperience(context), {
    wrapper: ({ children }: { children?: React.ReactNode }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    ),
  })
}

describe('initial state', () => {
  it('falls back to the default state', () => {
    const { result } = mountExperience()

    expect(result.current.selection).toBeNull()
    expect(result.current.siteFilter).toBe('')
    expect(result.current.showBoundaries).toBe(true)
    expect(result.current.showExcavationAreas).toBe(false)
    expect(result.current.layers).toEqual(['boundaries'])
  })

  it('reads the initial state from the url once', () => {
    const { result } = mountExperience('/?v=1&q=Uruk&l=areas&site=uruk')

    expect(result.current.siteFilter).toBe('Uruk')
    expect(result.current.showBoundaries).toBe(false)
    expect(result.current.showExcavationAreas).toBe(true)
    expect(result.current.selection).toEqual({
      type: 'site',
      provenanceId: 'uruk',
    })
  })
})

describe('layer actions', () => {
  it('derives the layer list from both toggles', () => {
    const { result } = mountExperience()

    act(() => result.current.setShowExcavationAreas(true))

    expect(result.current.layers).toEqual(['boundaries', 'areas'])
  })

  it('reports an empty layer list when everything is hidden', () => {
    const { result } = mountExperience()

    act(() => result.current.setShowBoundaries(false))

    expect(result.current.layers).toEqual([])
  })
})

describe('overlay actions', () => {
  it('activates and deactivates a single overlay', () => {
    const { result } = mountExperience()

    act(() => result.current.setOverlayActive(overlayA, true))
    expect(result.current.activeOverlays).toEqual([
      { id: 'overlay-a', opacity: 0.7, visible: true },
    ])

    act(() => result.current.setOverlayActive(overlayA, false))
    expect(result.current.activeOverlays).toEqual([])
  })

  it('changes the opacity of an active overlay', () => {
    const { result } = mountExperience()
    act(() => result.current.setOverlayActive(overlayA, true))

    act(() => result.current.setOverlayOpacity('overlay-a', 0.3))

    expect(result.current.activeOverlays[0].opacity).toBe(0.3)
  })

  it('activates and clears a whole series', () => {
    const { result } = mountExperience()

    act(() => result.current.setSeriesActive(series, true))
    expect(result.current.activeOverlays).toHaveLength(2)

    act(() => result.current.setSeriesActive(series, false))
    expect(result.current.activeOverlays).toEqual([])
  })

  it('clears every overlay', () => {
    const { result } = mountExperience()
    act(() => result.current.setSeriesActive(series, true))

    act(() => result.current.clearOverlays())

    expect(result.current.activeOverlays).toEqual([])
  })
})

describe('reset and restore', () => {
  it('returns to the default state', () => {
    const { result } = mountExperience('/?v=1&q=Uruk&l=areas')
    act(() => result.current.setOverlayActive(overlayA, true))

    act(() => result.current.reset())

    expect(result.current.siteFilter).toBe('')
    expect(result.current.showBoundaries).toBe(true)
    expect(result.current.showExcavationAreas).toBe(false)
    expect(result.current.activeOverlays).toEqual([])
    expect(result.current.selection).toBeNull()
  })

  it('restores a state supplied by browser navigation', () => {
    const { result } = mountExperience()

    act(() =>
      result.current.restore({
        ...DEFAULT_MAP_URL_STATE,
        layers: ['areas'],
        siteFilter: 'Nippur',
        selection: { type: 'excavation-area', polygonId: 'nippur-1' },
        overlays: [{ id: 'overlay-b', opacity: 0.2, visible: true }],
      }),
    )

    expect(result.current.siteFilter).toBe('Nippur')
    expect(result.current.showExcavationAreas).toBe(true)
    expect(result.current.showBoundaries).toBe(false)
    expect(result.current.selection).toEqual({
      type: 'excavation-area',
      polygonId: 'nippur-1',
    })
    expect(result.current.activeOverlays).toHaveLength(1)
  })
})

describe('selection', () => {
  it('stores and clears a selection', () => {
    const { result } = mountExperience()

    act(() =>
      result.current.setSelection({ type: 'site', provenanceId: 'babylon' }),
    )
    expect(result.current.selection).toEqual({
      type: 'site',
      provenanceId: 'babylon',
    })

    act(() => result.current.setSelection(null))
    expect(result.current.selection).toBeNull()
  })

  it('stores a site filter', () => {
    const { result } = mountExperience()

    act(() => result.current.setSiteFilter('Kalḫu'))

    expect(result.current.siteFilter).toBe('Kalḫu')
  })
})
