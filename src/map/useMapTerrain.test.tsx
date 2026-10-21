import { act, renderHook } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { deriveTerrainCapability } from 'map/mapTerrainCapability'
import { AWS_TERRAIN_TILES } from 'map/mapTerrainSource'
import { TERRAIN_SOURCE_ID } from 'map/mapTerrainLayers'
import useMapTerrain from 'map/useMapTerrain'

jest.mock('map/mapTerrainCapability')
const capability = deriveTerrainCapability as jest.MockedFunction<
  typeof deriveTerrainCapability
>

beforeEach(() => {
  resetMapLibreMock()
  capability.mockReturnValue({
    isSupported: true,
    source: AWS_TERRAIN_TILES,
    exaggeration: 1.4,
    unavailableReason: null,
  })
})

function setupMap() {
  const map = createMapMock()
  const mapRef: MutableRefObject<MapLibreMap | null> = {
    current: asLibreMap(map),
  }
  return { map, mapRef }
}

it('waits for late map creation without changing the terrain request', () => {
  const { map, mapRef } = setupMap()
  mapRef.current = null
  const { result, rerender } = renderHook(
    ({ isReady }) => useMapTerrain(mapRef, true, { isReady }),
    { initialProps: { isReady: false } },
  )
  expect(result.current.isEnabled).toBe(false)
  expect(map.setTerrain).not.toHaveBeenCalled()
  mapRef.current = asLibreMap(map)

  rerender({ isReady: true })

  expect(result.current.isEnabled).toBe(true)
  expect(map.terrain).toEqual({ source: TERRAIN_SOURCE_ID, exaggeration: 1.4 })
})

it('waits for the first style and restores terrain after replacement', () => {
  const { map, mapRef } = setupMap()
  map.getStyle.mockReturnValue(undefined)
  const { result } = renderHook(() => useMapTerrain(mapRef, true))
  expect(result.current.isEnabled).toBe(false)
  expect(map.listenerCount('style.load')).toBe(1)

  act(() => {
    map.getStyle.mockReturnValue({})
    map.setStyleLoaded(false)
    map.emit('style.load')
  })
  expect(result.current.isEnabled).toBe(true)
  expect(map.setTerrain).toHaveBeenCalledTimes(1)

  act(() => {
    map.layers.clear()
    map.sources.clear()
    map.terrain = null
    map.emit('style.load')
  })
  expect(map.setTerrain).toHaveBeenCalledTimes(2)
  expect(map.terrain).toEqual({ source: TERRAIN_SOURCE_ID, exaggeration: 1.4 })
})

it('applies and disables terrain while unrelated sources are loading', () => {
  const { map, mapRef } = setupMap()
  map.setStyleLoaded(false)
  const { result, rerender } = renderHook(
    ({ requested }) => useMapTerrain(mapRef, requested),
    { initialProps: { requested: true } },
  )
  expect(result.current.isEnabled).toBe(true)

  rerender({ requested: false })

  expect(result.current.isEnabled).toBe(false)
  expect(map.terrain).toBeNull()
  expect(map.sources.size).toBe(0)
  expect(map.layers.size).toBe(0)
  expect(map.listenerCount('style.load')).toBe(0)
})

it('preserves changed exaggeration and hillshade controls', () => {
  const { map, mapRef } = setupMap()
  const { rerender } = renderHook(
    ({ exaggeration, isHillshadeVisible }) =>
      useMapTerrain(mapRef, true, { exaggeration, isHillshadeVisible }),
    { initialProps: { exaggeration: 1.6, isHillshadeVisible: true } },
  )
  expect(map.terrain).toEqual({ source: TERRAIN_SOURCE_ID, exaggeration: 1.6 })

  rerender({ exaggeration: 2, isHillshadeVisible: false })

  expect(map.terrain).toEqual({ source: TERRAIN_SOURCE_ID, exaggeration: 2 })
  expect(map.setLayoutProperty).toHaveBeenLastCalledWith(
    'ebl-terrain-hillshade',
    'visibility',
    'none',
  )
})

it('disconnects and ignores stale callbacks without touching a replacement map', () => {
  const { map, mapRef } = setupMap()
  const listen = jest.spyOn(map, 'on')
  const { unmount } = renderHook(() => useMapTerrain(mapRef, true))
  const listener = listen.mock.calls[0][1]
  const replacement = createMapMock()
  mapRef.current = asLibreMap(replacement)

  act(() => listener())
  expect(map.setTerrain).toHaveBeenCalledTimes(1)
  unmount()
  act(() => listener())

  expect(map.listenerCount('style.load')).toBe(0)
  expect(map.setTerrain).toHaveBeenCalledTimes(1)
  expect(replacement.setTerrain).not.toHaveBeenCalled()
})

it('does not clean nonexistent resources before the first style', () => {
  const { map, mapRef } = setupMap()
  map.getStyle.mockReturnValue(undefined)
  const { unmount } = renderHook(() => useMapTerrain(mapRef, true))
  unmount()
  expect(map.setTerrain).not.toHaveBeenCalled()
  expect(map.listenerCount('style.load')).toBe(0)
})

it('does not touch resources after the style has been removed', () => {
  const { map, mapRef } = setupMap()
  const { unmount } = renderHook(() => useMapTerrain(mapRef, true))
  map.getStyle.mockReturnValue(undefined)
  unmount()
  expect(map.setTerrain).toHaveBeenCalledTimes(1)
})

it('does not claim terrain for a missing map or unsupported renderer', () => {
  const { map, mapRef } = setupMap()
  mapRef.current = null
  const { result, rerender } = renderHook(
    ({ isReady }) => useMapTerrain(mapRef, true, { isReady }),
    { initialProps: { isReady: true } },
  )
  expect(result.current.isEnabled).toBe(false)
  Object.defineProperty(map, 'setTerrain', { value: undefined })
  mapRef.current = asLibreMap(map)
  rerender({ isReady: false })
  rerender({ isReady: true })
  expect(result.current.isEnabled).toBe(false)
})

it('leaves unsupported capabilities and missing sources inactive', () => {
  const { map, mapRef } = setupMap()
  capability.mockReturnValue({
    ...deriveTerrainCapability(),
    isSupported: false,
  })
  const { result, unmount } = renderHook(() => useMapTerrain(mapRef, true))
  expect(result.current.isEnabled).toBe(false)
  unmount()
  capability.mockReturnValue({
    ...deriveTerrainCapability(),
    isSupported: true,
    source: null,
  })
  const { result: missingSourceResult } = renderHook(() =>
    useMapTerrain(mapRef, true),
  )
  expect(missingSourceResult.current.isEnabled).toBe(false)
  expect(map.setTerrain).not.toHaveBeenCalled()
})
