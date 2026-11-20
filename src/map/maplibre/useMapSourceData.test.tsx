import { act, renderHook } from '@testing-library/react'

import {
  mockFitBounds,
  mockGetSource,
  mockMapInstance,
  resetMapMocks,
} from 'map/testSupport/mapLibreMock'
import { makeProvenance } from 'map/testFixtures/provenance'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useMapCameraOwnership from 'map/maplibre/useMapCameraOwnership'

jest.mock('maplibre-gl')

const first = [makeProvenance()]
const second = [makeProvenance({ id: 'uruk', longName: 'Uruk' })]

describe('useMapSourceData', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    resetMapMocks()
  })

  afterEach(() => jest.useRealTimers())

  it('lets an explicit camera reset win over the matching source update', () => {
    mockGetSource.mockReturnValue({ setData: jest.fn() })
    const mapRef = { current: mockMapInstance as never }
    const { result, rerender } = renderHook(
      ({ provenances }) => {
        const camera = useMapCameraOwnership(provenances)
        useMapSourceData(mapRef, provenances, camera)
        return camera
      },
      { initialProps: { provenances: first } },
    )

    act(() => {
      result.current.claim()
    })
    act(() => jest.advanceTimersByTime(250))
    expect(mockFitBounds).not.toHaveBeenCalled()

    rerender({ provenances: second })
    act(() => jest.advanceTimersByTime(250))
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })

  it('does not suppress a later filter fit when reset precedes source load', () => {
    mockGetSource.mockReturnValue(undefined)
    const mapRef = { current: mockMapInstance as never }
    const { result, rerender } = renderHook(
      ({ provenances }) => {
        const camera = useMapCameraOwnership(provenances)
        useMapSourceData(mapRef, provenances, camera)
        return camera
      },
      { initialProps: { provenances: first } },
    )

    act(() => {
      result.current.claim()
    })
    mockGetSource.mockReturnValue({ setData: jest.fn() })
    rerender({ provenances: second })
    act(() => jest.advanceTimersByTime(250))

    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })
})
