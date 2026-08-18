import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { DEFAULT_MAP_URL_STATE, type MapCameraState } from './mapUrlState'

export function readMapCamera(map: MapLibreMap): MapCameraState {
  const center = map.getCenter()
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }
}

export function applyMapCamera(map: MapLibreMap, camera: MapCameraState): void {
  map.jumpTo({
    center: [...camera.center],
    zoom: camera.zoom,
    bearing: camera.bearing,
    pitch: camera.pitch,
  })
}

/**
 * Tracks the camera on `moveend` only, so continuous panning and zooming
 * never triggers a React update.
 */
export default function useMapCamera(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isReady: boolean,
): MapCameraState {
  const [camera, setCamera] = useState<MapCameraState>(
    DEFAULT_MAP_URL_STATE.camera,
  )
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isReady) return

    const updateCamera = (): void => {
      if (isMountedRef.current) {
        setCamera(readMapCamera(map))
      }
    }

    map.on('moveend', updateCamera)
    return () => {
      map.off('moveend', updateCamera)
    }
  }, [mapRef, isReady])

  return camera
}
