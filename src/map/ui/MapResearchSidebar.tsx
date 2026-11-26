import React from 'react'
import { polygonLinkedData } from 'map/domain/polygonLinkedData'
import type { MapTabState } from 'map/ui/useMapTabState'
import MapSelectionInspector from 'map/ui/MapSelectionInspector'
import MapExcavationBrowser from 'map/ui/MapExcavationBrowser'
import MapPanelDock from 'map/ui/MapPanelDock'
import MapInspector from 'map/ui/MapInspector'
import MapVisualizationControl from 'map/ui/MapVisualizationControl'
import MapMeasurePanel from 'map/ui/MapMeasurePanel'
import type { MapPanelDefinition } from 'map/ui/MapToolbar'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'

export default function MapResearchSidebar({
  state,
}: {
  readonly state: MapTabState
}): JSX.Element {
  const panels: readonly MapPanelDefinition[] = [
    {
      id: 'visualization',
      label: 'Visualization',
      isSupported:
        state.canShowExcavationAreas && !state.isExcavationAreasUnavailable,
      render: () => (
        <MapVisualizationControl
          mode={state.visualization.effectiveMode}
          legend={state.visualization.legend}
          isDensityAvailable={state.visualization.isDensityAvailable}
          hasUnavailableData={state.visualization.hasUnavailableData}
          onModeChange={state.experience.setVisualization}
        />
      ),
    },
    {
      id: 'measurement',
      label: 'Measure',
      isSupported: !state.isBackgroundUnavailable,
      render: () => <MapMeasurePanel measurement={state.measurement} />,
    },
  ]
  return (
    <aside className="map-research-panel" aria-label="Site research">
      <MapPanelDock panel={state.panel} panels={panels} />
      <MapSelectionInspector
        research={state.research}
        provenances={state.provenances}
        polygonIndex={state.polygonIndex}
        renderAreaDetails={(polygon) => (
          <MapInspector
            key={polygon.polygonId}
            polygon={polygon}
            {...polygonLinkedData(state.fragmentMapData, polygon)}
          />
        )}
      />
      <MapExcavationBrowser
        polygonIndex={state.polygonIndex}
        selectedId={state.research.selectedAreaId}
        onSelect={state.inspectArea}
      />
      <FindspotEmptyState
        provenances={state.filteredProvenances}
        filter={state.experience.filter}
      />
      <FindspotSearchList
        provenances={state.filteredProvenances}
        selectedId={state.research.selectedSiteId}
        onSelect={state.inspectSite}
      />
    </aside>
  )
}
