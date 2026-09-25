import { act, renderHook, waitFor } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  clearMockStyleResources,
  mockAddSource,
  mockIsStyleLoaded,
  mockMapInstance,
  mockRemoveLayer,
  mockRemoveSource,
  mockSetTerrain,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import { TERRAIN_SOURCE_ID } from 'map/mapTerrainLayers'
import useMapTerrain from 'map/useMapTerrain'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')

const mapRef: MutableRefObject<MapLibreMap | null> = { current: null }

describe('useMapTerrain', () => {
  beforeEach(() => {
    resetMapMocks()
    mapRef.current = asLibreMap(mockMapInstance)
  })

  it('waits for initial style load and reports actual activation', async () => {
    mockIsStyleLoaded.mockReturnValue(false)
    const { result } = renderHook(() => useMapTerrain(mapRef, true))

    expect(result.current.status).toBe('loading')
    expect(result.current.isEnabled).toBe(false)
    expect(mockSetTerrain).not.toHaveBeenCalled()

    act(() => {
      mockIsStyleLoaded.mockReturnValue(true)
      triggerMapEvent('style.load')
      triggerMapEvent('load')
    })

    await waitFor(() => expect(result.current.status).toBe('enabled'))
    expect(mockSetTerrain).toHaveBeenCalledTimes(1)
    expect(mockSetTerrain).toHaveBeenCalledWith({
      source: TERRAIN_SOURCE_ID,
      exaggeration: 1.4,
    })
  })

  it('reinstalls terrain after the map style reloads', () => {
    renderHook(() => useMapTerrain(mapRef, true))
    expect(mockSetTerrain).toHaveBeenCalledTimes(1)
    clearMockStyleResources()

    act(() => triggerMapEvent('style.load'))

    expect(mockSetTerrain).toHaveBeenCalledTimes(2)
    expect(mockAddSource).toHaveBeenCalledTimes(4)
  })

  it('removes owned terrain when the request is disabled', () => {
    const { result, rerender } = renderHook(
      ({ requested }) => useMapTerrain(mapRef, requested),
      { initialProps: { requested: true } },
    )
    expect(result.current.isEnabled).toBe(true)

    rerender({ requested: false })

    expect(result.current.status).toBe('off')
    expect(mockSetTerrain).toHaveBeenLastCalledWith(null)
  })

  it('fails closed and clears the request on a terrain tile error', async () => {
    const onUnavailable = jest.fn()
    const { result } = renderHook(() =>
      useMapTerrain(mapRef, true, { onUnavailable }),
    )

    act(() =>
      triggerMapEvent('error', {
        sourceId: TERRAIN_SOURCE_ID,
        tile: {},
        error: { message: 'tile failed' },
      }),
    )

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.isEnabled).toBe(false)
    expect(result.current.errorMessage).toBe(
      'Elevation tiles could not be loaded.',
    )
    expect(onUnavailable).toHaveBeenCalledTimes(1)
  })

  it('reports partial cleanup without claiming disabled terrain is active', () => {
    const { result, rerender } = renderHook(
      ({ requested }) => useMapTerrain(mapRef, requested),
      { initialProps: { requested: true } },
    )
    mockMapInstance.getSource.mockReturnValue({ oldStyle: true })
    mockRemoveSource.mockImplementation(() => {
      throw new Error('source busy')
    })

    rerender({ requested: false })

    expect(result.current.isEnabled).toBe(false)
    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toContain('could not be released')
  })

  it('releases failed old-style cleanup without touching replacement resources', async () => {
    const { result, rerender } = renderHook(
      ({ requested }) => useMapTerrain(mapRef, requested),
      { initialProps: { requested: true } },
    )
    mockSetTerrain.mockImplementation((terrain) => {
      if (terrain === null) throw new Error('style transition')
    })
    mockRemoveLayer.mockImplementation(() => {
      throw new Error('style transition')
    })
    mockMapInstance.getSource.mockReturnValue({ oldStyle: true })
    mockRemoveSource.mockImplementation(() => {
      throw new Error('style transition')
    })

    rerender({ requested: false })
    expect(result.current.isEnabled).toBe(true)

    mockSetTerrain.mockClear()
    mockRemoveLayer.mockClear()
    mockRemoveSource.mockClear()
    mockMapInstance.getSource.mockReturnValue({ replacementStyle: true })
    act(() => triggerMapEvent('style.load'))

    await waitFor(() => expect(result.current.status).toBe('off'))
    expect(mockSetTerrain).not.toHaveBeenCalled()
    expect(mockRemoveLayer).not.toHaveBeenCalled()
    expect(mockRemoveSource).not.toHaveBeenCalled()
  })

  it('treats reserved ids in a replacement style as foreign', async () => {
    const onUnavailable = jest.fn()
    const { result } = renderHook(() =>
      useMapTerrain(mapRef, true, { onUnavailable }),
    )
    mockMapInstance.getSource.mockReturnValue({ foreign: true })

    act(() => triggerMapEvent('style.load'))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(mockRemoveSource).not.toHaveBeenCalled()
    expect(onUnavailable).toHaveBeenCalledTimes(1)
  })

  it('does not remove a foreign source when setup detects a collision', async () => {
    mockMapInstance.getSource.mockReturnValue({ foreign: true })
    const onUnavailable = jest.fn()
    const { result } = renderHook(() =>
      useMapTerrain(mapRef, true, { onUnavailable }),
    )

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(mockRemoveSource).not.toHaveBeenCalled()
    expect(onUnavailable).toHaveBeenCalledTimes(1)
  })

  it('ignores events from a map that has been replaced', () => {
    const { result } = renderHook(() => useMapTerrain(mapRef, true))
    expect(result.current.isEnabled).toBe(true)
    mapRef.current = null

    act(() => triggerMapEvent('style.load'))

    expect(result.current.isEnabled).toBe(true)
    expect(mockSetTerrain).toHaveBeenCalledTimes(1)
  })
})
