import React from 'react'
import { Alert } from 'react-bootstrap'
import MapLayerControls from 'map/MapLayerControls'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import type { MapTabState } from 'map/useMapTabState'

export default function MapLayerPanel({
  state,
  showUnavailableWarning = true,
}: {
  readonly showUnavailableWarning?: boolean
  readonly state: Pick<
    MapTabState,
    | 'selectedPolygon'
    | 'showExcavationAreas'
    | 'canShowExcavationAreas'
    | 'excavationPolygons'
  > & {
    readonly isExcavationAreasLoading?: boolean
    readonly isExcavationAreasUnavailable?: boolean
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
      {state.isExcavationAreasUnavailable && showUnavailableWarning ? (
        <Alert variant="warning">Excavation areas are unavailable.</Alert>
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
