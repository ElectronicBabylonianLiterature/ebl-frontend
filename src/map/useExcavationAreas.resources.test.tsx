import React from 'react'
import { act, render, renderHook } from '@testing-library/react'
import useExcavationAreas from 'map/useExcavationAreas'
import { Harness } from 'map/useExcavationAreas.testSupport'
import {
  mockAddLayer,
  mockAddSource,
  mockGetLayer,
  mockGetSource,
  mockQueryRenderedFeatures,
  mockRemoveLayer,
  mockRemoveSource,
  mockSetFeatureState,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('waits for a map owner before accessing resources', () => {
  const { unmount } = renderHook(() =>
    useExcavationAreas(
      { current: null },
      { isVisible: true, selectedPolygonId: null, onSelectPolygon: jest.fn() },
    ),
  )

  expect(mockAddSource).not.toHaveBeenCalled()
  expect(unmount).not.toThrow()
})

it('reuses installed resources and tolerates their removal before cleanup', () => {
  mockGetSource.mockReturnValue({})
  mockGetLayer.mockReturnValue({ id: 'existing-layer' })
  const { unmount } = render(<Harness />)

  expect(mockAddSource).not.toHaveBeenCalled()
  expect(mockAddLayer).not.toHaveBeenCalled()
  mockGetLayer.mockReturnValue(undefined)
  mockGetSource.mockReturnValue(undefined)
  unmount()
  expect(mockRemoveLayer).not.toHaveBeenCalled()
  expect(mockRemoveSource).not.toHaveBeenCalled()
})

it('clears the previous selected feature when changing or hiding selection', () => {
  mockGetSource.mockReturnValue({})
  const { rerender } = render(<Harness selectedPolygonId="area-a" />)
  rerender(<Harness selectedPolygonId="area-b" />)
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'area-a' },
    { selected: false },
  )
  mockSetFeatureState.mockClear()
  act(() => triggerMapEvent('style.load'))
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'area-b' },
    { selected: true },
  )
  expect(mockSetFeatureState).not.toHaveBeenCalledWith(expect.anything(), {
    selected: false,
  })
  rerender(<Harness isVisible={false} selectedPolygonId="area-b" />)
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'area-b' },
    { selected: false },
  )
})

it.each([{ features: [] }, { features: [{ id: 42 }] }])(
  'ignores clicks without a canonical string id %j',
  ({ features }) => {
    const onSelectPolygon = jest.fn()
    mockQueryRenderedFeatures.mockReturnValue(features)
    render(<Harness onSelectPolygon={onSelectPolygon} />)
    act(() =>
      triggerMapEvent(
        'click',
        { point: { x: 0, y: 0 } },
        'excavation-area-fill',
      ),
    )
    expect(onSelectPolygon).not.toHaveBeenCalled()
  },
)

it('handles excavation errors without an availability subscriber', () => {
  render(<Harness />)

  expect(() =>
    act(() =>
      triggerMapEvent('error', {
        error: { message: 'asset unavailable' },
        sourceId: 'excavation-areas',
      }),
    ),
  ).not.toThrow()
})
