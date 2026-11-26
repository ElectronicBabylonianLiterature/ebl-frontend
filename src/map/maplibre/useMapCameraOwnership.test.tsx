import { useMemo } from 'react'
import { act, renderHook } from '@testing-library/react'
import { filterProvenances } from 'map/domain/findspotFilter'
import { focusFindspot } from 'map/maplibre/focusFindspot'
import { resetMapCamera } from 'map/maplibre/mapCamera'
import useMapCameraOwnership from 'map/maplibre/useMapCameraOwnership'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import {
  mockBoundsExtend,
  mockEaseTo,
  mockFitBounds,
  mockGetSource,
  mockMapInstance,
  resetMapMocks,
} from 'map/testSupport/mapLibreMock'
import { makeProvenance } from 'map/testFixtures/provenance'

jest.mock('maplibre-gl')

const PROVENANCES = [
  makeProvenance(),
  makeProvenance({
    id: 'uruk',
    longName: 'Uruk',
    coordinates: { longitude: 45.64, latitude: 31.32 },
  }),
]

function renderCamera() {
  const mapRef = { current: mockMapInstance as never }
  return renderHook(
    ({ filter }) => {
      const data = useMemo(
        () => filterProvenances(PROVENANCES, filter),
        [filter],
      )
      const camera = useMapCameraOwnership(data)
      useMapSourceData(mapRef, data, camera)
      return { camera, data }
    },
    { initialProps: { filter: '' } },
  )
}

function finishFit(): void {
  act(() => jest.advanceTimersByTime(250))
}

beforeEach(() => {
  jest.useFakeTimers()
  resetMapMocks()
  mockGetSource.mockReturnValue({ setData: jest.fn() })
})
afterEach(() => jest.useRealTimers())

it('fits all sites after clearing a filter that followed an explicit camera action', () => {
  const { result, rerender } = renderCamera()
  finishFit()
  act(() => {
    result.current.camera.claim()
  })
  rerender({ filter: 'Uruk' })
  finishFit()
  mockFitBounds.mockClear()
  mockBoundsExtend.mockClear()

  rerender({ filter: '' })
  expect(result.current.data).toBe(PROVENANCES)
  finishFit()

  expect(mockFitBounds).toHaveBeenCalledTimes(1)
  expect(mockBoundsExtend.mock.calls).toEqual([
    [[44.42, 32.542]],
    [[45.64, 31.32]],
  ])
})

it.each(['capture', 'claim'] as const)(
  'never revives an old %s after a filter roundtrip',
  (method) => {
    const { result, rerender } = renderCamera()
    const isCurrent = result.current.camera[method]()
    expect(isCurrent()).toBe(true)

    rerender({ filter: 'Uruk' })
    expect(isCurrent()).toBe(false)
    rerender({ filter: '' })

    expect(isCurrent()).toBe(false)
    expect(result.current.camera.shouldFitData()).toBe(true)
  },
)

it.each(['Inspect', 'Reset'])(
  'preserves a newer %s action while the restored all-sites fit is queued',
  (action) => {
    const { result, rerender } = renderCamera()
    finishFit()
    act(() => {
      result.current.camera.claim()
    })
    rerender({ filter: 'Uruk' })
    finishFit()
    rerender({ filter: '' })
    act(() => {
      result.current.camera.claim()
      if (action === 'Inspect') {
        focusFindspot(mockMapInstance as never, [44.42, 32.542])
      } else {
        resetMapCamera(mockMapInstance as never)
      }
    })
    expect(mockEaseTo).toHaveBeenCalledTimes(1)
    mockFitBounds.mockClear()
    finishFit()

    expect(mockFitBounds).not.toHaveBeenCalled()
    expect(result.current.camera.shouldFitData()).toBe(false)
  },
)
