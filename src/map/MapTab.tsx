import React, { useEffect, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Spinner from 'common/ui/Spinner'
import useMapTabState, { type MapTabState } from 'map/useMapTabState'
import useProvenances from 'map/useProvenances'
import MapLayerControls from 'map/MapLayerControls'
import MapSelectedAreaCard from 'map/MapSelectedAreaCard'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import { isMapSiteId } from 'map/mapSites'
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
  const { experience, selectedPolygon } = state
  const isPresenting = experience.presentation.isActive
  const presentationTriggerRef = useRef<HTMLButtonElement>(null)
  const wasPresentingRef = useRef(false)

  useEffect(() => {
    if (wasPresentingRef.current && !isPresenting) {
      presentationTriggerRef.current?.focus()
    }
    wasPresentingRef.current = isPresenting
  }, [isPresenting])

  const selectedSiteData =
    selectedPolygon && isMapSiteId(selectedPolygon.siteId)
      ? state.fragmentMapData.sites.get(selectedPolygon.siteId)
      : undefined

  const panels: readonly MapPanelDefinition[] = [
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
      ),
    },
  ]

  return (
    <MapTabLoadedView
      state={state}
      panels={panels}
      presentationTriggerRef={presentationTriggerRef}
      selectionPanelId="layers"
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
