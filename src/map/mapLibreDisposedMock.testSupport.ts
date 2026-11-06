import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  mockGetLayer,
  mockGetSource,
  mockMapInstance,
  mockRemove,
} from 'map/mapLibreMock.testSupport'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

export function rejectDisposedMapAccess(): void {
  let isRemoved = false
  mockRemove.mockImplementation(() => {
    isRemoved = true
  })
  const requireActiveMap = (): undefined => {
    if (isRemoved) throw new Error('map style has been removed')
    return undefined
  }
  mockGetLayer.mockImplementation(requireActiveMap)
  mockGetSource.mockImplementation(requireActiveMap)
}

export function useDisposingMockMap(): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(asLibreMap(mockMapInstance))
  useEffect(
    () => () => {
      mockRemove()
      mapRef.current = null
    },
    [],
  )
  return mapRef
}
