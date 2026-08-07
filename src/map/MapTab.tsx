import React from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Spinner from 'common/ui/Spinner'
import MapExperienceHeader from './MapExperienceHeader'
import MapPresentationBar from './MapPresentationBar'
import Map3dTourControls from './Map3dTourControls'
import { analyticalHeightDisclaimer } from './map3dLabels'
import MapStage from './MapStage'
import MapPanelDock from './MapPanelDock'
import MapSelectionPill from './MapSelectionPill'
import useMapTabState from './useMapTabState'
import './MapTab.sass'

interface Props {
  findspotService: FindspotService
  fragmentService: FragmentService
}

export default function MapTab({
  findspotService,
  fragmentService,
}: Props): JSX.Element {
  const state = useMapTabState(findspotService, fragmentService)
  const {
    experience,
    filteredProvenances,
    mapPanel,
    presentation,
    research,
    siteData,
    visualization,
  } = state
  const isPresenting = presentation.isActive

  if (siteData.provenanceError) {
    return (
      <Alert variant="danger">
        Failed to load map data: {siteData.provenanceError}
      </Alert>
    )
  }

  if (!siteData.provenances) {
    return <Spinner>Loading map data...</Spinner>
  }

  const selectionTitle =
    research.selectedPolygonSummary?.displayName ??
    research.selectedSiteSummary?.siteName ??
    null

  return (
    <div
      className={`map-tab map-experience${
        isPresenting ? ' map-experience--presenting' : ''
      }`}
    >
      {isPresenting ? (
        <>
          <MapPresentationBar
            title={selectionTitle}
            onExit={presentation.exit}
          />
          <Map3dTourControls tour={state.threeD.tour} isCompact />
        </>
      ) : (
        <MapExperienceHeader
          siteFilter={experience.siteFilter}
          visibleSiteCount={filteredProvenances?.length ?? 0}
          hasSelection={experience.selection !== null}
          onSiteFilterChange={experience.setSiteFilter}
          onClearSelection={state.dismissSelection}
          onEnterPresentation={presentation.enter}
          onResetView={state.resetView}
        />
      )}
      {!isPresenting && filteredProvenances?.length === 0 ? (
        <Alert variant="info">
          No findspots match &ldquo;{experience.siteFilter}&rdquo;.
        </Alert>
      ) : null}
      <div className="map-experience__body">
        <MapStage
          containerRef={state.mapContainer}
          hoverPreview={isPresenting ? null : state.hoverPreview}
          isBackgroundUnavailable={state.isBackgroundUnavailable}
          legend={visualization.legend}
          visualizationMode={visualization.effectiveMode}
          showLegend={!isPresenting}
          selectionPill={
            !isPresenting &&
            experience.selection !== null &&
            mapPanel.active !== 'inspector' ? (
              <MapSelectionPill
                label="Show selected area"
                onShow={() => mapPanel.open('inspector')}
              />
            ) : null
          }
          analyticalNote={
            state.threeD.panel.mode === 'extrusion'
              ? analyticalHeightDisclaimer(state.threeD.panel.metric)
              : null
          }
          controls={
            isPresenting ? null : (
              <MapPanelDock
                panel={mapPanel}
                mapRef={state.mapRef}
                drawerRef={state.drawerRef}
                excavationPolygonIndex={siteData.excavationPolygonIndex}
                polygonSummaries={siteData.polygonSummaries}
                info={state.info}
                tools={state.tools}
              />
            )
          }
        />
      </div>
    </div>
  )
}
