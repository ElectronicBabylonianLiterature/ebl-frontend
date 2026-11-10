import React from 'react'
import MapLayerControls from 'map/ui/MapLayerControls'
import MapExcavationAreaSelector from 'map/ui/MapExcavationAreaSelector'
import type { MapTabState } from 'map/ui/useMapTabState'

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
    readonly isExcavationAreasLoading?: boolean
    readonly experience: Pick<
      MapTabState['experience'],
      'setShowExcavationAreas' | 'setSelection'
    >
    readonly panel: Pick<MapTabState['panel'], 'open'>
  }
}): JSX.Element {
  return (
    <>
      {state.isExcavationAreasLoading ? (
        <p role="status">Loading excavation areas...</p>
      ) : null}
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
