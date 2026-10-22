import React from 'react'
import MapLayerControls from 'map/MapLayerControls'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import type { MapTabState } from 'map/useMapTabState'

export default function MapLayerPanel({
  state,
}: {
  readonly state: Pick<
    MapTabState,
    | 'selectedPolygon'
    | 'showExcavationAreas'
    | 'canShowExcavationAreas'
    | 'excavationPolygons'
  > & {
    readonly experience: Pick<
      MapTabState['experience'],
      'setShowExcavationAreas' | 'setSelection'
    >
    readonly panel: Pick<MapTabState['panel'], 'open'>
  }
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
          state.experience.setSelection(
            polygonId === null ? null : { type: 'excavation-area', polygonId },
          )
        }
        onView={() => state.panel.open('inspector')}
      />
    </>
  )
}
