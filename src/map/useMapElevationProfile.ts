import { useEffect, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { geodesicPathLengthMetres } from './geodesicDistance'
import {
  type ElevationProfile,
  type ElevationSample,
  buildElevationProfile,
  elevationSampleCount,
  sampleAlongPath,
  toSourceElevation,
} from './mapElevationProfile'

export type ElevationProfileStatus =
  | 'empty'
  | 'terrain-unavailable'
  | 'unsupported'
  | 'ready'

export interface MapElevationProfile {
  readonly status: ElevationProfileStatus
  readonly profile: ElevationProfile | null
  readonly sampleCount: number
}

interface ElevationQueryable {
  queryTerrainElevation?: (lngLat: {
    lng: number
    lat: number
  }) => number | null | undefined
}

const EMPTY: MapElevationProfile = {
  status: 'empty',
  profile: null,
  sampleCount: 0,
}

function elevationAt(
  map: ElevationQueryable,
  position: Position,
  exaggeration: number,
): number | null {
  return toSourceElevation(
    map.queryTerrainElevation?.({ lng: position[0], lat: position[1] }),
    exaggeration,
  )
}
export default function useMapElevationProfile(
  mapRef: MutableRefObject<MapLibreMap | null>,
  positions: readonly Position[],
  isTerrainEnabled: boolean,
  exaggeration: number,
): MapElevationProfile {
  const [result, setResult] = useState<MapElevationProfile>(EMPTY)

  useEffect(() => {
    if (positions.length < 2) {
      setResult(EMPTY)
      return
    }

    if (!isTerrainEnabled) {
      setResult({ ...EMPTY, status: 'terrain-unavailable' })
      return
    }

    const map = mapRef.current as (MapLibreMap & ElevationQueryable) | null
    if (map === null || typeof map.queryTerrainElevation !== 'function') {
      setResult({ ...EMPTY, status: 'unsupported' })
      return
    }

    let isCancelled = false
    const length = geodesicPathLengthMetres(positions) ?? 0
    const points = sampleAlongPath(positions, elevationSampleCount(length))
    const samples: ElevationSample[] = points.map((point) => ({
      position: point.position,
      distanceMetres: point.distanceMetres,
      elevationMetres: elevationAt(map, point.position, exaggeration),
    }))
    const profile = buildElevationProfile(samples)

    if (!isCancelled) {
      setResult({
        status: profile === null ? 'unsupported' : 'ready',
        profile,
        sampleCount: samples.length,
      })
    }

    return () => {
      isCancelled = true
    }
  }, [mapRef, positions, isTerrainEnabled, exaggeration])

  return result
}
