import { act, renderHook } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  mockMapInstance,
  mockSetTerrain,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import {
  TERRAIN_HILLSHADE_LAYER_ID,
  TERRAIN_HILLSHADE_SOURCE_ID,
  TERRAIN_SOURCE_ID,
} from 'map/mapTerrainLayers'
import { deriveTerrainCapability } from 'map/mapTerrainCapability'
import { AWS_TERRAIN_TILES } from 'map/mapTerrainSource'
import useMapTerrain from 'map/useMapTerrain'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')
jest.mock('map/mapTerrainCapability')

const mockCapability = deriveTerrainCapability as jest.MockedFunction<
  typeof deriveTerrainCapability
>
const mapRef: MutableRefObject<MapLibreMap | null> = { current: null }

beforeEach(() => {
  resetMapMocks()
  mapRef.current = asLibreMap(mockMapInstance)
  mockCapability.mockReturnValue({
    isSupported: true,
    source: AWS_TERRAIN_TILES,
    exaggeration: 1.4,
    unavailableReason: null,
  })
})

test.each([true, false])(
  'reports unsupported terrain when requested=%s',
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
    expect(onUnavailable).toHaveBeenCalledTimes(requested ? 1 : 0)
    expect(mockSetTerrain).not.toHaveBeenCalled()
  },
)

test('does not install terrain before the map exists', () => {
  mapRef.current = null
  const { result } = renderHook(() => useMapTerrain(mapRef, true))

  expect(result.current.status).toBe('loading')
  expect(mockSetTerrain).not.toHaveBeenCalled()
})

test('reports a renderer without terrain support', () => {
  const map = asLibreMap({ ...mockMapInstance })
  Object.defineProperty(map, 'setTerrain', { value: undefined })
  mapRef.current = map
  const onUnavailable = jest.fn()
  const { result } = renderHook(() =>
    useMapTerrain(mapRef, true, { onUnavailable }),
  )

  expect(result.current.errorMessage).toBe(
    'This map renderer does not support terrain.',
  )
  expect(onUnavailable).toHaveBeenCalledTimes(1)
})

test('ignores unrelated and malformed map errors', () => {
  const onUnavailable = jest.fn()
  const { result } = renderHook(() =>
    useMapTerrain(mapRef, true, { onUnavailable }),
  )

  act(() => {
    triggerMapEvent('error')
    triggerMapEvent('error', { sourceId: 'basemap' })
    triggerMapEvent('error', { layer: { id: 'basemap' } })
  })

  expect(result.current.status).toBe('enabled')
  expect(onUnavailable).not.toHaveBeenCalled()
})

test.each([
  { sourceId: TERRAIN_HILLSHADE_SOURCE_ID },
  { layer: { id: TERRAIN_HILLSHADE_LAYER_ID } },
])('handles a hillshade error once: %j', (event) => {
  const onUnavailable = jest.fn()
  const { result } = renderHook(() =>
    useMapTerrain(mapRef, true, { onUnavailable }),
  )

  act(() => {
    triggerMapEvent('error', event)
    triggerMapEvent('error', event)
  })

  expect(result.current.status).toBe('error')
  expect(onUnavailable).toHaveBeenCalledTimes(1)
})

test('reports non-Error setup failures', () => {
  const setupFailure = 'renderer failure'
  mockSetTerrain.mockImplementationOnce(() => {
    throw setupFailure
  })
  const { result } = renderHook(() => useMapTerrain(mapRef, true))

  expect(result.current.errorMessage).toBe('Terrain setup failed.')
})

test('keeps retained ownership when a requested reinstall cannot release terrain', () => {
  const { result, rerender } = renderHook(
    ({ exaggeration }) => useMapTerrain(mapRef, true, { exaggeration }),
    { initialProps: { exaggeration: 1.4 } },
  )
  mockSetTerrain.mockImplementation((terrain) => {
    if (terrain === null) throw new Error('style busy')
  })

  rerender({ exaggeration: 1.5 })

  expect(result.current.isEnabled).toBe(true)
  expect(mockSetTerrain).toHaveBeenCalledTimes(2)
  expect(mockSetTerrain).toHaveBeenNthCalledWith(1, {
    source: TERRAIN_SOURCE_ID,
    exaggeration: 1.4,
  })
})
