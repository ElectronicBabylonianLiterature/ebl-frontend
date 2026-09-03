import { act, renderHook } from '@testing-library/react'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'
import type { BoundingBox } from './mapGeometry'
import { type TourInput, buildTourSteps, tourProgressLabel } from './map3dTour'
import useMap3dTour from './useMap3dTour'

jest.mock('common/utils/prefersReducedMotion')

const reducedMotion = prefersReducedMotion as jest.MockedFunction<
  typeof prefersReducedMotion
>

const SITE: BoundingBox = [43.2, 35.4, 43.3, 35.5]
const AREA: BoundingBox = [43.24, 35.44, 43.26, 35.46]

function input(overrides: Partial<TourInput> = {}): TourInput {
  return {
    siteName: 'Aššur',
    siteBounds: SITE,
    excavationBounds: AREA,
    selectedPolygonBounds: null,
    activeOverlayBounds: null,
    isTerrainEnabled: false,
    ...overrides,
  }
}

function idsFor(overrides: Partial<TourInput> = {}): readonly string[] {
  return buildTourSteps(input(overrides)).map((step) => step.id)
}

beforeEach(() => {
  resetMapLibreMock()
  reducedMotion.mockReturnValue(false)
})

describe('buildTourSteps', () => {
  it('derives every keyframe from bounds, never from coordinates', () => {
    expect(idsFor()).toEqual(['overview', 'excavation-areas', 'inspect'])
  })

  it('adds the terrain and overlay steps when they exist', () => {
    expect(
      idsFor({
        isTerrainEnabled: true,
        selectedPolygonBounds: AREA,
        activeOverlayBounds: SITE,
      }),
    ).toEqual([
      'overview',
      'terrain',
      'excavation-areas',
      'selected-area',
      'historical-map',
      'inspect',
    ])
  })

  it('skips the polygon and overlay steps rather than failing', () => {
    const ids = idsFor({ excavationBounds: null })

    expect(ids).toEqual(['overview', 'inspect'])
    expect(ids).not.toContain('selected-area')
  })

  it('works for a site that only has coordinates', () => {
    expect(idsFor({ excavationBounds: null, siteBounds: SITE })).toHaveLength(2)
  })

  it('is empty when the site has no bounds at all', () => {
    expect(idsFor({ siteBounds: null, excavationBounds: null })).toEqual([])
  })

  it('pitches into the scene after the flat overview', () => {
    const steps = buildTourSteps(input({ isTerrainEnabled: true }))

    expect(steps[0].pitch).toBe(0)
    expect(steps[1].pitch).toBeGreaterThan(0)
  })
})

describe('tourProgressLabel', () => {
  it('is announced as a one-based step', () => {
    const steps = buildTourSteps(input())

    expect(tourProgressLabel(0, steps.length, steps[0])).toBe(
      'Step 1 of 3: Aššur overview',
    )
    expect(tourProgressLabel(0, 0, undefined)).toBe('Tour unavailable')
  })
})

describe('useMap3dTour', () => {
  function renderTour(overrides: Partial<TourInput> = {}) {
    const map = createMapMock()
    const mapRef = { current: asLibreMap(map) }
    const view = renderHook(() => useMap3dTour(mapRef, input(overrides)))
    return { map, ...view }
  }

  it('does not start on its own', () => {
    const { result, map } = renderTour()

    expect(result.current.isRunning).toBe(false)
    expect(result.current.canStart).toBe(true)
    expect(map.fitBounds).not.toHaveBeenCalled()
  })

  it('moves forwards and backwards through the steps', () => {
    const { result } = renderTour()

    act(() => result.current.start())
    expect(result.current.index).toBe(0)

    act(() => result.current.next())
    expect(result.current.index).toBe(1)

    act(() => result.current.previous())
    expect(result.current.index).toBe(0)
  })

  it('stops at both ends', () => {
    const { result } = renderTour()

    act(() => result.current.start())
    act(() => result.current.previous())
    expect(result.current.index).toBe(0)

    act(() => result.current.next())
    act(() => result.current.next())
    act(() => result.current.next())
    expect(result.current.index).toBe(result.current.steps.length - 1)
  })

  it('exits through its control and through Escape', () => {
    const { result } = renderTour()

    act(() => result.current.start())
    act(() => result.current.exit())
    expect(result.current.isRunning).toBe(false)

    act(() => result.current.start())
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(result.current.isRunning).toBe(false)
  })

  it('yields the camera back when the reader drags the map', () => {
    const { result, map } = renderTour()

    act(() => result.current.start())
    act(() => map.emit('dragstart'))

    expect(result.current.isRunning).toBe(false)
  })

  it('jumps between keyframes under reduced motion', () => {
    reducedMotion.mockReturnValue(true)
    const { result, map } = renderTour()

    act(() => result.current.start())

    expect(map.fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 0 }),
    )
  })

  it('animates when motion is allowed', () => {
    const { result, map } = renderTour()

    act(() => result.current.start())

    expect(map.fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: expect.any(Number), pitch: 0 }),
    )
  })

  it('cannot start without steps and cleans up its listeners', () => {
    const { result, map, unmount } = renderTour({
      siteBounds: null,
      excavationBounds: null,
    })

    expect(result.current.canStart).toBe(false)
    act(() => result.current.start())
    expect(result.current.isRunning).toBe(false)

    unmount()
    expect(map.listenerCount('dragstart')).toBe(0)
  })
})
