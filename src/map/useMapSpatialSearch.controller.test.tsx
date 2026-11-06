import { act, renderHook } from '@testing-library/react'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import {
  mockGetBounds,
  mockGetCenter,
  mockMapInstance,
  resetMapMocks,
} from 'map/mapLibreMock.testSupport'
import useMapSpatialSearch from 'map/useMapSpatialSearch'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')

const EMPTY_INDEX: ExcavationPolygonIndex = new Map()
const EMPTY_DATA: FragmentMapDataState = {
  sites: new Map(),
  findspots: [],
  polygonSummaries: new Map(),
}

beforeEach(resetMapMocks)

it.each([
  { reason: 'the map is unavailable', hasMap: false, active: true },
  { reason: 'the tool is inactive', hasMap: true, active: false },
])('ignores spatial commands when $reason', ({ hasMap, active }) => {
  const mapRef = { current: hasMap ? asLibreMap(mockMapInstance) : null }
  const { result } = renderHook(() =>
    useMapSpatialSearch(mapRef, active, EMPTY_INDEX, EMPTY_DATA),
  )

  act(() => {
    result.current.searchViewport()
    result.current.addCornerAtCenter()
  })

  expect(mockGetBounds).not.toHaveBeenCalled()
  expect(mockGetCenter).not.toHaveBeenCalled()
  expect(result.current.shape).toBeNull()
  expect(result.current.cornerCount).toBe(0)
})

it('does not restart drawing through a retained command after deactivation', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const { result, rerender } = renderHook(
    ({ active }) =>
      useMapSpatialSearch(mapRef, active, EMPTY_INDEX, EMPTY_DATA),
    { initialProps: { active: true } },
  )
  const startDrawing = result.current.startDrawing
  act(() => startDrawing())
  expect(result.current.isDrawing).toBe(true)
  rerender({ active: false })

  act(() => startDrawing())

  expect(result.current.isDrawing).toBe(false)
  expect(result.current.shape).toBeNull()
})

it('ignores center corners until drawing and retains valid corners after an invalid center', () => {
  const mapRef = { current: asLibreMap(mockMapInstance) }
  const { result } = renderHook(() =>
    useMapSpatialSearch(mapRef, true, EMPTY_INDEX, EMPTY_DATA),
  )

  act(() => result.current.addCornerAtCenter())
  expect(mockGetCenter).not.toHaveBeenCalled()
  act(() => result.current.startDrawing())
  act(() => result.current.addCornerAtCenter())
  mockGetCenter.mockReturnValue({ lng: 43, lat: Number.NaN })

  act(() => result.current.addCornerAtCenter())

  expect(result.current.cornerCount).toBe(1)
  expect(result.current.isDrawing).toBe(true)
  expect(result.current.shape).toBeNull()
  expect(result.current.validationMessage).toBeNull()
})
