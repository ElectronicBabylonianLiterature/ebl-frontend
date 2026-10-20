import { useEffect, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { DEFAULT_MAP_URL_STATE, type MapCameraState } from 'map/mapUrlState'

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

export default function useMapCamera(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isReady: boolean,
  requestedCamera: MapCameraState | null = null,
): MapCameraState {
  const [observed, setObserved] = useState({
    request: requestedCamera,
    camera: requestedCamera ?? DEFAULT_MAP_URL_STATE.camera,
  })

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isReady) return
    let active = true
    const updateCamera = (): void => {
      if (active && mapRef.current === map) {
        setObserved({ request: requestedCamera, camera: readMapCamera(map) })
      }
    }
    if (requestedCamera) applyMapCamera(map, requestedCamera)
    updateCamera()
    map.on('moveend', updateCamera)
    map.on('load', updateCamera)
    return () => {
      active = false
      map.off('moveend', updateCamera)
      map.off('load', updateCamera)
    }
  }, [mapRef, isReady, requestedCamera])

  return observed.request === requestedCamera
    ? observed.camera
    : (requestedCamera ?? DEFAULT_MAP_URL_STATE.camera)
}
