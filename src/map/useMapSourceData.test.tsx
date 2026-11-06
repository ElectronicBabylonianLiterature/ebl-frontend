import { act, renderHook } from '@testing-library/react'

import {
  mockFitBounds,
  mockGetSource,
  mockMapInstance,
  resetMapMocks,
} from 'map/mapLibreMock.testSupport'
import { makeProvenance } from 'map/provenanceTestData'
import useMapSourceData from 'map/useMapSourceData'

jest.mock('maplibre-gl')

const first = [makeProvenance()]
const second = [makeProvenance({ id: 'uruk', longName: 'Uruk' })]
const third = [makeProvenance({ id: 'nippur', longName: 'Nippur' })]

describe('useMapSourceData', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    resetMapMocks()
  })

  afterEach(() => jest.useRealTimers())

  it('lets an explicit camera reset win over the matching source update', () => {
    mockGetSource.mockReturnValue({ setData: jest.fn() })
    const mapRef = { current: mockMapInstance as never }
    const { rerender } = renderHook(
      ({ provenances, cameraResetVersion }) =>
        useMapSourceData(mapRef, provenances, cameraResetVersion),
      { initialProps: { provenances: first, cameraResetVersion: 0 } },
    )

    rerender({ provenances: second, cameraResetVersion: 1 })
    act(() => jest.advanceTimersByTime(250))
    expect(mockFitBounds).not.toHaveBeenCalled()

    rerender({ provenances: third, cameraResetVersion: 1 })
    act(() => jest.advanceTimersByTime(250))
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })

  it('does not suppress a later filter fit when reset precedes source load', () => {
    mockGetSource.mockReturnValue(undefined)
    const mapRef = { current: mockMapInstance as never }
    const { rerender } = renderHook(
      ({ provenances, cameraResetVersion }) =>
        useMapSourceData(mapRef, provenances, cameraResetVersion),
      { initialProps: { provenances: first, cameraResetVersion: 0 } },
    )

    rerender({ provenances: second, cameraResetVersion: 1 })
    mockGetSource.mockReturnValue({ setData: jest.fn() })
    rerender({ provenances: third, cameraResetVersion: 1 })
    act(() => jest.advanceTimersByTime(250))

    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })
})
