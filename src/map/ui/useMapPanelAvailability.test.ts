import { renderHook } from '@testing-library/react'
import type { ActiveMapPanel } from 'map/domain/mapPanel'
import useMapPanelAvailability from 'map/ui/useMapPanelAvailability'

interface PanelCase {
  readonly active: ActiveMapPanel
  readonly canShowExcavationAreas: boolean
  readonly isBackgroundUnavailable: boolean
  readonly closeCalls: number
}

it.each<PanelCase>([
  {
    active: 'export',
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 1,
  },
  {
    active: 'export',
    canShowExcavationAreas: true,
    isBackgroundUnavailable: false,
    closeCalls: 0,
  },
  {
    active: 'visualization',
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
    closeCalls: 0,
  },
  {
    active: 'visualization',
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 1,
  },
  {
    active: 'measurement',
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 0,
  },
  {
    active: 'measurement',
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
    closeCalls: 1,
  },
  {
    active: 'spatial-search',
    canShowExcavationAreas: true,
    isBackgroundUnavailable: false,
    closeCalls: 0,
  },
  {
    active: 'spatial-search',
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
    closeCalls: 1,
  },
  {
    active: 'spatial-search',
    canShowExcavationAreas: false,
    isBackgroundUnavailable: false,
    closeCalls: 1,
  },
  {
    active: 'spatial-search',
    canShowExcavationAreas: false,
    isBackgroundUnavailable: true,
    closeCalls: 2,
  },
  {
    active: null,
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
        active: 'measurement' as ActiveMapPanel,
        canShowExcavationAreas: true,
        isBackgroundUnavailable: false,
      },
    },
  )
  expect(close).not.toHaveBeenCalled()

  rerender({
    active: 'measurement',
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
  })
  expect(close).toHaveBeenCalledTimes(1)
  rerender({
    active: 'visualization',
    canShowExcavationAreas: true,
    isBackgroundUnavailable: true,
  })
  expect(close).toHaveBeenCalledTimes(1)
  rerender({
    active: 'visualization',
    canShowExcavationAreas: false,
    isBackgroundUnavailable: true,
  })
  expect(close).toHaveBeenCalledTimes(2)
})
