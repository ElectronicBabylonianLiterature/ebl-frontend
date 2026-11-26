import { act, renderHook } from '@testing-library/react'
import {
  mockGetSource,
  mockMapInstance,
  mockFitBounds,
  resetMapMocks,
} from 'map/testSupport/mapLibreMock'
import { makeProvenance } from 'map/testFixtures/provenance'
import useMapSourceData from 'map/maplibre/useMapSourceData'

jest.mock('maplibre-gl')

it('waits for a mounted map before querying a source', (): void => {
  resetMapMocks()
  renderHook((): void =>
    useMapSourceData({ current: null }, [makeProvenance()]),
  )
  expect(mockGetSource).not.toHaveBeenCalled()
})

it('waits for provenance data before querying the mounted map', (): void => {
  resetMapMocks()
  renderHook((): void =>
    useMapSourceData({ current: mockMapInstance as never }, null),
  )
  expect(mockGetSource).not.toHaveBeenCalled()
})

it('updates and fits initial data when no camera reset version is supplied', (): void => {
  jest.useFakeTimers()
  resetMapMocks()
  const setData = jest.fn()
  mockGetSource.mockReturnValue({ setData })
  const { unmount } = renderHook((): void =>
    useMapSourceData({ current: mockMapInstance as never }, [makeProvenance()]),
  )
  expect(setData).toHaveBeenCalledTimes(1)
  act((): void => {
    jest.advanceTimersByTime(250)
  })
  expect(mockFitBounds).toHaveBeenCalledTimes(1)
  unmount()
  jest.useRealTimers()
})
