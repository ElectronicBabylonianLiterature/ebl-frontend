import React from 'react'
import { mapSiteName } from 'fragmentarium/domain/mapSites'
import { polygonLinkedData } from 'map/domain/polygonLinkedData'
import type { MapTabState } from 'map/ui/useMapTabState'
import MapSelectionInspector from 'map/ui/MapSelectionInspector'
import MapExcavationBrowser from 'map/ui/MapExcavationBrowser'
import MapPanelDock from 'map/ui/MapPanelDock'
import MapInspector from 'map/ui/MapInspector'
import MapVisualizationControl from 'map/ui/MapVisualizationControl'
import MapMeasurePanel from 'map/ui/MapMeasurePanel'
import MapSpatialSearchPanel from 'map/ui/MapSpatialSearchPanel'
import type { MapPanelDefinition } from 'map/ui/MapToolbar'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'

export default function MapResearchSidebar({
  state,
}: {
  readonly state: MapTabState
}): JSX.Element {
  const polygon = state.selectedPolygon
  const panels: readonly MapPanelDefinition[] = [
    ...(polygon
      ? [
          {
            id: 'inspector' as const,
            label: 'Selected area',
            isSupported: true,
            render: () => (
              <MapInspector
                key={polygon.polygonId}
                polygon={polygon}
                {...polygonLinkedData(state.fragmentMapData, polygon)}
                siteName={mapSiteName(polygon.siteId)}
                onClear={state.research.close}
              />
            ),
          },
        ]
      : []),
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
    {
      id: 'spatial-search',
      label: 'Search area',
      isSupported:
        state.canShowExcavationAreas &&
        !state.isExcavationAreasUnavailable &&
        !state.isBackgroundUnavailable,
      render: () => (
        <MapSpatialSearchPanel
          spatialSearch={state.spatialSearch}
          findspots={state.fragmentMapData.findspots}
        />
      ),
    },
  ]
  return (
    <aside className="map-research-panel" aria-label="Site research">
      <MapPanelDock panel={state.panel} panels={panels} />
      <MapSelectionInspector
        research={state.research}
        provenances={state.provenances}
        polygonIndex={state.polygonIndex}
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
