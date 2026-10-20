import React from 'react'
import MapLayerControls from 'map/MapLayerControls'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import type { MapTabState } from 'map/useMapTabState'

export default function MapLayerPanel({
  state,
  clearSelection,
}: {
  readonly state: Pick<
    MapTabState,
    | 'selectedPolygon'
    | 'showExcavationAreas'
    | 'canShowExcavationAreas'
    | 'excavationPolygons'
    | 'selectPolygon'
  > & {
    readonly experience: Pick<
      MapTabState['experience'],
      'setShowExcavationAreas'
    >
  }
  readonly clearSelection: () => void
}): JSX.Element {
  return (
    <>
      <MapLayerControls
        showExcavationAreas={state.showExcavationAreas}
        canShowExcavationAreas={state.canShowExcavationAreas}
        onShowExcavationAreasChange={state.experience.setShowExcavationAreas}
      />
      <MapExcavationAreaSelector
        polygons={state.excavationPolygons}
        selectedPolygonId={state.selectedPolygon?.polygonId ?? null}
        onSelect={(polygonId) =>
          polygonId ? state.selectPolygon(polygonId) : clearSelection()
        }
      />
    </>
  )
}
