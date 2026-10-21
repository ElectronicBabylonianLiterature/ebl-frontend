import { act, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  mockAddSource,
  mockMapInstance,
  mockOn,
  mockSetTerrain,
  resetMapMocks,
} from 'map/mapLibreMock.testSupport'
import {
  TERRAIN_HILLSHADE_LAYER_ID,
  TERRAIN_HILLSHADE_SOURCE_ID,
  TERRAIN_SOURCE_ID,
} from 'map/mapTerrainLayers'
import { deriveTerrainCapability } from 'map/mapTerrainCapability'
import { approvedTerrainSource } from 'map/mapTerrainSource'
import useMapTerrain from 'map/useMapTerrain'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')
jest.mock('map/mapTerrainCapability')

const mockCapability = deriveTerrainCapability as jest.MockedFunction<
  typeof deriveTerrainCapability
>
const mapRef: { current: MapLibreMap | null } = { current: null }

function errorHandler(): (event: unknown) => void {
  const handler = mockOn.mock.calls.find(([event]) => event === 'error')?.[1]
  if (typeof handler !== 'function') throw new Error('Missing error listener')
  return (event) => handler(event)
}

beforeEach(() => {
  resetMapMocks()
  mapRef.current = asLibreMap(mockMapInstance)
  mockCapability.mockReturnValue({
    isSupported: true,
    source: approvedTerrainSource(),
    exaggeration: 1.4,
    unavailableReason: null,
  })
})

it.each([false, true])(
  'handles unsupported terrain when requested=%s',
  (requested) => {
    mockCapability.mockReturnValue({
      isSupported: false,
      source: null,
      exaggeration: 1.4,
      unavailableReason: 'no-approved-source',
    })
    const onUnavailable = jest.fn()
    const { result } = renderHook(() =>
      useMapTerrain(mapRef, requested, { onUnavailable }),
    )

    expect(result.current.status).toBe('unavailable')
    expect(result.current.isEnabled).toBe(false)
    expect(onUnavailable).toHaveBeenCalledTimes(requested ? 1 : 0)
    expect(mockSetTerrain).not.toHaveBeenCalled()
  },
)

it('does not touch a renderer that has not been created', () => {
  mapRef.current = null
  const { result } = renderHook(() => useMapTerrain(mapRef, true))

  expect(result.current.status).toBe('loading')
  expect(mockOn).not.toHaveBeenCalled()
  expect(mockSetTerrain).not.toHaveBeenCalled()
})

it('reports an unsupported renderer and clears the request', () => {
  mapRef.current = asLibreMap({ ...mockMapInstance })
  Object.defineProperty(mapRef.current, 'setTerrain', { value: undefined })
  const onUnavailable = jest.fn()
  const { result } = renderHook(() =>
    useMapTerrain(mapRef, true, { onUnavailable }),
  )

  expect(result.current.errorMessage).toBe(
    'This map renderer does not support terrain.',
  )
  expect(result.current.isEnabled).toBe(false)
  expect(onUnavailable).toHaveBeenCalledTimes(1)
})

it('ignores unrelated and malformed errors without disabling terrain', () => {
  const { result } = renderHook(() => useMapTerrain(mapRef, true))
  const onError = errorHandler()

  act(() => {
    onError(null)
    onError({ sourceId: 'unrelated-source' })
    onError({ layer: { id: 'unrelated-layer' } })
  })

  expect(result.current.status).toBe('enabled')
  expect(mockSetTerrain).toHaveBeenCalledTimes(1)
})

it.each([
  { sourceId: TERRAIN_HILLSHADE_SOURCE_ID },
  { layer: { id: TERRAIN_HILLSHADE_LAYER_ID } },
])('fails once for a hillshade error and repeated notifications', (event) => {
  const onUnavailable = jest.fn()
  const { result } = renderHook(() =>
    useMapTerrain(mapRef, true, { onUnavailable }),
  )
  const onError = errorHandler()

  act(() => {
    onError(event)
    onError(event)
  })

  expect(result.current.status).toBe('error')
  expect(result.current.isEnabled).toBe(false)
  expect(onUnavailable).toHaveBeenCalledTimes(1)
})

it('reports a non-Error renderer setup failure without retaining terrain', () => {
  mockAddSource.mockImplementationOnce(() => {
    throw new Event('renderer-failure')
  })
  const onUnavailable = jest.fn()
  const { result } = renderHook(() =>
    useMapTerrain(mapRef, true, { onUnavailable }),
  )

  expect(result.current.errorMessage).toBe('Terrain setup failed.')
  expect(result.current.isEnabled).toBe(false)
  expect(onUnavailable).toHaveBeenCalledTimes(1)
})

it.each(['disposed', 'replaced'] as const)(
  'ignores a queued terrain error after the map is %s',
  (state) => {
    const onUnavailable = jest.fn()
    const { unmount } = renderHook(() =>
      useMapTerrain(mapRef, true, { onUnavailable }),
    )
    const onError = errorHandler()
    if (state === 'disposed') unmount()
    else mapRef.current = null
    mockSetTerrain.mockClear()

    act(() => onError({ sourceId: TERRAIN_SOURCE_ID }))

    expect(onUnavailable).not.toHaveBeenCalled()
    expect(mockSetTerrain).not.toHaveBeenCalled()
  },
)
