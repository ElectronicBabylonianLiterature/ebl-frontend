import React, { useRef } from 'react'
import { act, render } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useMapFeatureSelection from 'map/maplibre/useMapFeatureSelection'
import {
  clearMockStyleResources,
  mockAddSource,
  mockAddLayer,
  mockGetStyle,
  mockGetSource,
  mockRemoveSource,
  mockRemoveLayer,
  mockMapInstance,
  mockSetPaintProperty,
  mockSetLayoutProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/testSupport/mapLibreMock'

jest.mock('maplibre-gl')

const INDEX: ExcavationPolygonIndex = new Map()

function Harness({
  index = INDEX,
  retryVersion = 0,
  onUnavailable,
}: {
  index?: ExcavationPolygonIndex | null
  retryVersion?: number
  onUnavailable?: (unavailable: boolean) => void
}): null {
  const ref = useRef(mockMapInstance as unknown as MapLibreMap)
  useExcavationAreas(ref, false, onUnavailable, index, retryVersion)
  useMapFeatureSelection(
    ref,
    null,
    'uruk-area',
    index ?? undefined,
    retryVersion,
  )
  return null
}

beforeEach(resetMapMocks)

it('installs delayed validated data before restoring selected emphasis on style reload', () => {
  const { rerender } = render(<Harness index={null} />)
  expect(mockAddSource).not.toHaveBeenCalled()
  rerender(<Harness />)
  clearMockStyleResources()
  mockAddLayer.mockClear()
  mockSetPaintProperty.mockClear()
  act(() => triggerMapEvent('style.load'))
  expect(mockAddLayer).toHaveBeenCalledTimes(2)
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-outline',
    'line-width',
    expect.any(Array),
  )
  expect(mockSetPaintProperty.mock.invocationCallOrder[0]).toBeGreaterThan(
    mockAddLayer.mock.invocationCallOrder[1],
  )
})

it('reinstalls failed layers on retry with the current visibility and selection', () => {
  const { rerender } = render(<Harness />)
  mockAddSource.mockClear()
  mockSetPaintProperty.mockClear()
  mockSetLayoutProperty.mockClear()
  rerender(<Harness retryVersion={1} />)
  expect(mockAddSource).toHaveBeenCalledTimes(1)
  expect(mockSetLayoutProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'visibility',
    'none',
  )
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-outline',
    'line-width',
    expect.any(Array),
  )
})

it.each([true, false])(
  'keeps a synchronous installation failure recoverable (status callback %s)',
  (withCallback) => {
    mockAddSource.mockImplementationOnce(() => {
      throw new Error('style transition')
    })
    const onUnavailable = jest.fn()
    expect(() =>
      render(
        <Harness onUnavailable={withCallback ? onUnavailable : undefined} />,
      ),
    ).not.toThrow()
    if (withCallback) expect(onUnavailable).toHaveBeenCalledWith(true)
    act(() => triggerMapEvent('style.load'))
    expect(mockAddLayer).toHaveBeenCalledTimes(2)
  },
)

it('does not write to or remove a style that is temporarily unavailable', () => {
  const { unmount } = render(<Harness />)
  mockSetLayoutProperty.mockClear()
  mockGetStyle.mockReturnValue(undefined)
  act(() => triggerMapEvent('styledata'))
  expect(unmount).not.toThrow()
  expect(mockRemoveLayer).not.toHaveBeenCalled()
  expect(mockSetLayoutProperty).not.toHaveBeenCalled()
})

it('removes installed excavation sources after removing their dependent layers', () => {
  const { unmount } = render(<Harness />)
  mockGetSource.mockReturnValue({})
  unmount()
  expect(mockRemoveLayer).toHaveBeenCalledWith('excavation-area-fill')
  expect(mockRemoveLayer).toHaveBeenCalledWith('excavation-area-outline')
  expect(mockRemoveSource).toHaveBeenCalledWith('excavation-areas')
  expect(mockRemoveSource.mock.invocationCallOrder[0]).toBeGreaterThan(
    mockRemoveLayer.mock.invocationCallOrder[1],
  )
})

it('cleans up safely after a style transition has already removed the layers', () => {
  const { unmount } = render(<Harness />)
  clearMockStyleResources()
  expect(unmount).not.toThrow()
  expect(mockRemoveLayer).not.toHaveBeenCalled()
  expect(mockRemoveSource).not.toHaveBeenCalled()
})
