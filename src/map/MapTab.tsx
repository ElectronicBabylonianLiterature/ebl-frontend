import React, { useEffect, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Spinner from 'common/ui/Spinner'
import useMapTabState, { type MapTabState } from 'map/useMapTabState'
import useProvenances from 'map/useProvenances'
import MapLayerControls from 'map/MapLayerControls'
import MapInspector from 'map/MapInspector'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import { findMapSite, isMapSiteId } from 'map/mapSites'
import type { MapPanelDefinition } from 'map/MapToolbar'
import MapTabLoadedView from 'map/MapTabLoadedView'
import 'map/MapTab.sass'

interface Props {
  readonly findspotService: FindspotService
  readonly fragmentService: FragmentService
}

function LoadedMapTab({
  findspotService,
  provenances,
}: {
  readonly findspotService: FindspotService
  readonly provenances: MapTabState['provenances']
}): JSX.Element {
  const state = useMapTabState(findspotService, provenances)
  const { experience, panel, selectedPolygon } = state
  const isPresenting = experience.presentation.isActive
  const presentationTriggerRef = useRef<HTMLButtonElement>(null)
  const wasPresentingRef = useRef(false)

  useEffect(() => {
    if (wasPresentingRef.current && !isPresenting) {
      presentationTriggerRef.current?.focus()
    }
    wasPresentingRef.current = isPresenting
  }, [isPresenting])

  const clearSelection = (): void => {
    experience.setSelection(null)
    panel.close()
  }

  const selectedSiteData =
    selectedPolygon && isMapSiteId(selectedPolygon.siteId)
      ? state.fragmentMapData.sites.get(selectedPolygon.siteId)
      : undefined

  const panels: readonly MapPanelDefinition[] = [
    {
      id: 'inspector',
      label: 'Selected area',
      isSupported: selectedPolygon !== null,
      render: () =>
        selectedPolygon ? (
          <MapInspector
            polygon={selectedPolygon}
            summary={selectedSiteData?.polygonSummaries.get(
              selectedPolygon.polygonId,
            )}
            siteName={
              findMapSite(selectedPolygon.siteId)?.siteName ??
              selectedPolygon.siteId
            }
            status={selectedSiteData?.status ?? 'not-configured'}
            onClear={clearSelection}
          />
        ) : (
          <p>No excavation area is selected.</p>
        ),
    },
    {
      id: 'layers',
      label: 'Map layers',
      isSupported: true,
      render: () => (
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
              polygonId ? state.selectPolygon(polygonId) : clearSelection()
            }
          />
        </>
      ),
    },
  ]

  return (
    <MapTabLoadedView
      state={state}
      panels={panels}
      presentationTriggerRef={presentationTriggerRef}
    />
  )
}

export default function MapTab({
  findspotService,
  fragmentService,
}: Props): JSX.Element {
  const { provenances, error } = useProvenances(fragmentService)

  if (error) {
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  }

  if (provenances === null) {
    return <Spinner>Loading map data...</Spinner>
  }

  return (
    <LoadedMapTab findspotService={findspotService} provenances={provenances} />
  )
}
