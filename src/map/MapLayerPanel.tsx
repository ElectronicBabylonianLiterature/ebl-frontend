import React from 'react'
import MapLayerControls from 'map/MapLayerControls'
import MapSelectedAreaCard from 'map/MapSelectedAreaCard'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import { isMapSiteId } from 'map/mapSites'
import type { MapTabState } from 'map/useMapTabState'

export default function MapLayerPanel({
  state,
}: {
  readonly state: Pick<
    MapTabState,
    | 'selectedPolygon'
    | 'fragmentMapData'
    | 'showExcavationAreas'
    | 'canShowExcavationAreas'
    | 'excavationPolygons'
  > & {
    readonly experience: Pick<
      MapTabState['experience'],
      'setShowExcavationAreas' | 'setSelection'
    >
  }
}): JSX.Element {
  const { experience, selectedPolygon } = state
  const selectedSiteData =
    selectedPolygon && isMapSiteId(selectedPolygon.siteId)
      ? state.fragmentMapData.sites.get(selectedPolygon.siteId)
      : undefined

  return (
    <>
      <MapLayerControls
        showExcavationAreas={state.showExcavationAreas}
        canShowExcavationAreas={state.canShowExcavationAreas}
        onShowExcavationAreasChange={experience.setShowExcavationAreas}
      />
      <MapExcavationAreaSelector
        polygons={state.excavationPolygons}
        selectedPolygonId={selectedPolygon?.polygonId ?? null}
        onSelect={(polygonId) =>
          experience.setSelection(
            polygonId ? { type: 'excavation-area', polygonId } : null,
          )
        }
      />
      {selectedPolygon ? (
        <MapSelectedAreaCard
          polygonId={selectedPolygon.polygonId}
          polygonName={selectedPolygon.name}
          summary={selectedSiteData?.polygonSummaries.get(
            selectedPolygon.polygonId,
          )}
          status={selectedSiteData?.status ?? 'not-configured'}
          onClear={() => experience.setSelection(null)}
        />
      ) : null}
    </>
  )
}
