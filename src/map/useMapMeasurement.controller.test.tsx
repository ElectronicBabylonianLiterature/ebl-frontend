import { act, renderHook } from '@testing-library/react'
import {
  mockGetCenter,
  mockMapInstance,
  resetMapMocks,
} from 'map/mapLibreMock.testSupport'
import useMapMeasurement from 'map/useMapMeasurement'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('clears points only when the measurement mode changes', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const { result } = renderHook(() => useMapMeasurement(mapRef, true))
  act(() => result.current.addPointAtCenter())

  act(() => result.current.setMode('distance'))

  expect(result.current.pointCount).toBe(1)
  act(() => result.current.setMode('area'))
  expect(result.current.mode).toBe('area')
  expect(result.current.pointCount).toBe(0)

  act(() => {
    result.current.setMode('distance')
    result.current.addPointAtCenter()
    result.current.setMode('distance')
  })

  expect(result.current.mode).toBe('distance')
  expect(result.current.pointCount).toBe(1)
})

it.each([
  { reason: 'the map is unavailable', hasMap: false, active: true },
  { reason: 'the tool is inactive', hasMap: true, active: false },
])('ignores center-point commands when $reason', ({ hasMap, active }) => {
  const mapRef = { current: hasMap ? asLibreMap(mockMapInstance) : null }
  const { result } = renderHook(() => useMapMeasurement(mapRef, active))

  act(() => result.current.addPointAtCenter())

  expect(mockGetCenter).not.toHaveBeenCalled()
  expect(result.current.pointCount).toBe(0)
})

it('keeps existing points when the map reports an invalid center', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const { result } = renderHook(() => useMapMeasurement(mapRef, true))
  act(() => result.current.addPointAtCenter())
  mockGetCenter.mockReturnValue({ lng: Number.NaN, lat: 35 })

  act(() => result.current.addPointAtCenter())

  expect(result.current.pointCount).toBe(1)
})
