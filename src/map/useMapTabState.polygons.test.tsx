import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import useMapTabState from 'map/useMapTabState'
import useExcavationPolygonIndex from 'map/useExcavationPolygonIndex'
import { excavationPolygon } from 'test-support/map-fixtures'

jest.mock('map/useFindspotMap', () => ({
  __esModule: true,
  default: function useMockFindspotMap() {
    return jest.requireActual<typeof import('react')>('react').useRef(null)
  },
}))
jest.mock('map/useExcavationPolygonIndex')

it('sorts unnamed polygons by identifier and selects through the experience hook', () => {
  const polygons = [
    excavationPolygon({ polygonId: 'b', name: null }),
    excavationPolygon({ polygonId: 'a', name: null }),
    excavationPolygon({ polygonId: 'c', name: 'C' }),
  ]
  const mockIndex = useExcavationPolygonIndex as jest.MockedFunction<
    typeof useExcavationPolygonIndex
  >
  mockIndex.mockReturnValue({
    index: new Map([['assur', polygons]]),
    isLoaded: true,
    error: null,
  })
  const service = {
    fetchMapData: jest.fn().mockResolvedValue([]),
  } as unknown as FindspotService
  const { result } = renderHook(() => useMapTabState(service, []), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <MemoryRouter>{children}</MemoryRouter>
    ),
  })
  expect(
    result.current.excavationPolygons.map((polygon) => polygon.polygonId),
  ).toEqual(['a', 'b', 'c'])
  act(() =>
    result.current.experience.setSelection({
      type: 'excavation-area',
      polygonId: 'a',
    }),
  )
  expect(result.current.selectedPolygon?.polygonId).toBe('a')
  act(() => result.current.experience.setSelection(null))
  expect(result.current.selectedPolygon).toBeNull()
})
