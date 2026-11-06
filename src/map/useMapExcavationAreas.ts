import { useMemo, useState } from 'react'
import useExcavationAreas from 'map/useExcavationAreas'
import useExcavationPolygonIndex from 'map/useExcavationPolygonIndex'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/mapSiteCapabilities'

export default function useMapExcavationAreas(
  mapRef: Parameters<typeof useExcavationAreas>[0],
  requested: boolean,
): {
  isLoaded: boolean
  isUnavailable: boolean
  canShowExcavationAreas: boolean
  showExcavationAreas: boolean
} {
  const [sourceUnavailable, setSourceUnavailable] = useState(false)
  const { index, isLoaded, error } = useExcavationPolygonIndex()
  const isUnavailable = error !== null || sourceUnavailable
  const canShowExcavationAreas = useMemo(
    () =>
      isLoaded &&
      !isUnavailable &&
      anySiteHasExcavationPolygons(deriveMapSiteCapabilities(index)),
    [isLoaded, isUnavailable, index],
  )
  const showExcavationAreas = requested && canShowExcavationAreas
  useExcavationAreas(
    mapRef,
    showExcavationAreas,
    setSourceUnavailable,
    isLoaded && error === null ? index : null,
  )
  return {
    isLoaded,
    isUnavailable,
    canShowExcavationAreas,
    showExcavationAreas,
  }
}
