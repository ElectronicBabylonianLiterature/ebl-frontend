import { renderHook } from '@testing-library/react'
import type { ActiveMapPanel } from 'map/mapPanel'
import useMapPanelAvailability from 'map/useMapPanelAvailability'

interface PanelCase {
  readonly active: ActiveMapPanel
  readonly selectedPolygonId: string | null
  readonly canShowExcavationAreas: boolean
  readonly isBackgroundUnavailable: boolean
  readonly closeCalls: number
}

it.each<PanelCase>([
  {
    active: 'inspector',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: false,
    closeCalls: 1,
  },
  {
    active: 'inspector',
    selectedPolygonId: 'area',
    canShowExcavationAreas: false,
    isBackgroundUnavailable: true,
    closeCalls: 0,
  },
  {
    active: 'visualization',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
    closeCalls: 0,
  },
  {
    active: 'visualization',
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 1,
  },
  {
    active: 'measurement',
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 0,
  },
  {
    active: 'measurement',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
    closeCalls: 1,
  },
  {
    active: 'spatial-search',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: false,
    closeCalls: 0,
  },
  {
    active: 'spatial-search',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
    closeCalls: 1,
  },
  {
    active: 'spatial-search',
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 1,
  },
  {
    active: 'spatial-search',
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: true,
    closeCalls: 2,
  },
  {
    active: 'export',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
    closeCalls: 0,
  },
  {
    active: 'export',
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 1,
  },
  {
    active: 'layers',
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: true,
    closeCalls: 0,
  },
  {
    active: null,
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: true,
    closeCalls: 0,
  },
])('applies panel availability to %j', ({ closeCalls, ...options }) => {
  const close = jest.fn()
  renderHook(() =>
    useMapPanelAvailability({ active: options.active, close }, options),
  )

  expect(close).toHaveBeenCalledTimes(closeCalls)
})

it('reevaluates the active panel when its prerequisites change', () => {
  const close = jest.fn()
  const { rerender } = renderHook(
    (options) =>
      useMapPanelAvailability({ active: options.active, close }, options),
    {
      initialProps: {
        active: 'inspector' as ActiveMapPanel,
        selectedPolygonId: 'area' as string | null,
        canShowExcavationAreas: true,
        isBackgroundUnavailable: false,
      },
    },
  )
  expect(close).not.toHaveBeenCalled()

  rerender({
    active: 'inspector',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: false,
  })
  expect(close).toHaveBeenCalledTimes(1)
  rerender({
    active: 'export',
    selectedPolygonId: null,
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
  })
  expect(close).toHaveBeenCalledTimes(1)
  rerender({
    active: 'export',
    selectedPolygonId: null,
    canShowExcavationAreas: false,
    isBackgroundUnavailable: true,
  })
  expect(close).toHaveBeenCalledTimes(2)
})
