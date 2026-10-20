import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { act, renderHook } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import useMapCamera, { applyMapCamera, readMapCamera } from 'map/useMapCamera'
import { DEFAULT_MAP_URL_STATE, MapCameraState } from 'map/mapUrlState'

beforeEach(() => {
  resetMapLibreMock()
})

describe('readMapCamera', () => {
  it('reads centre, zoom, bearing and pitch', () => {
    const mapMock = createMapMock()
    applyMapCamera(asLibreMap(mapMock), {
      center: [43.25, 35.45],
      zoom: 12,
      bearing: 30,
      pitch: 45,
    })

    expect(readMapCamera(asLibreMap(mapMock))).toEqual({
      center: [43.25, 35.45],
      zoom: 12,
      bearing: 30,
      pitch: 45,
    })
  })
})

describe('useMapCamera', () => {
  function mountCamera(
    mapRef: MutableRefObject<MapLibreMap | null>,
    isReady: boolean,
  ) {
    return renderHook(({ ready }) => useMapCamera(mapRef, ready), {
      initialProps: { ready: isReady },
    })
  }

  it('returns the default camera before the map is ready', () => {
    const mapRef = { current: null }

    const { result } = mountCamera(mapRef, false)

    expect(result.current).toEqual(DEFAULT_MAP_URL_STATE.camera)
  })

  it('does not subscribe while the map is not ready', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }

    mountCamera(mapRef, false)

    expect(mapMock.listenerCount('moveend')).toBe(0)
  })

  it('reads the initial camera and then tracks changes on moveend only', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const { result } = mountCamera(mapRef, true)
    const initialCamera = readMapCamera(asLibreMap(mapMock))

    act(() => {
      applyMapCamera(asLibreMap(mapMock), {
        center: [1, 2],
        zoom: 9,
        bearing: 0,
        pitch: 0,
      })
    })
    expect(result.current).toEqual(initialCamera)

    act(() => mapMock.emit('moveend'))
    expect(result.current).toEqual({
      center: [1, 2],
      zoom: 9,
      bearing: 0,
      pitch: 0,
    })
  })

  it('observes the live camera when navigation stops requesting one', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const requested: MapCameraState = {
      center: [12, 34],
      zoom: 13,
      bearing: 0,
      pitch: 0,
    }
    const { result, rerender } = renderHook(
      ({ camera }: { camera: MapCameraState | null }) =>
        useMapCamera(mapRef, true, camera),
      { initialProps: { camera: requested as MapCameraState | null } },
    )
    // A source-data effect can fit the new filter before the camera effect runs.
    act(() => mapMock.jumpTo({ center: [43.26, 35.45], zoom: 12 }))

    rerender({ camera: null })

    expect(result.current).toEqual({
      center: [43.26, 35.45],
      zoom: 12,
      bearing: 0,
      pitch: 0,
    })
  })

  it('removes the listener on unmount', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const { unmount } = mountCamera(mapRef, true)

    unmount()

    expect(mapMock.listenerCount('moveend')).toBe(0)
  })

  it('ignores a moveend emitted after unmount', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const { result, unmount } = mountCamera(mapRef, true)
    const before = result.current

    unmount()
    act(() => mapMock.emit('moveend'))

    expect(result.current).toBe(before)
  })
})
