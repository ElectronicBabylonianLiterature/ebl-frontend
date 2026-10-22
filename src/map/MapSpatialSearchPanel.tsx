import React, { useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import type { FindspotMapData } from 'map/findspotMapData'
import { spatialSearchDescription } from 'map/spatialSearch'
import type { SpatialSearchController } from 'map/useMapSpatialSearch'
import MapSpatialSearchResults from 'map/MapSpatialSearchResults'

interface Props {
  readonly spatialSearch: SpatialSearchController
  readonly findspots: readonly FindspotMapData[]
}

function resultDescription(spatialSearch: SpatialSearchController): string {
  const { result, shape } = spatialSearch
  if (shape === null) {
    if (!spatialSearch.isDrawing) {
      return 'Search excavation areas by the current view or a drawn rectangle.'
    }
    const prompt = `Add corner ${spatialSearch.cornerCount + 1} of 2.`
    return spatialSearch.validationMessage
      ? `${spatialSearch.validationMessage} ${prompt}`
      : prompt
  }

  return `${spatialSearchDescription(shape)}: ${result.polygonIds.length} excavation areas; ${result.availablePolygonCount} with data available, ${result.loadingPolygonCount} loading, ${result.unavailablePolygonCount} unavailable. ${result.mappedPolygonCount} with mapped findspots, ${result.findspotIds.length} mapped findspots, ${result.accessibleFragmentCount} accessible tablets.`
}

export default function MapSpatialSearchPanel({
  spatialSearch,
  findspots,
}: Props): JSX.Element {
  const { shape, result, isDrawing } = spatialSearch
  const [searchVersion, setSearchVersion] = useState(0)
  const resultsKey = useMemo(
    () => JSON.stringify([searchVersion, shape]),
    [searchVersion, shape],
  )
  const searchViewport = (): void => {
    setSearchVersion((current) => current + 1)
    spatialSearch.searchViewport()
  }

  return (
    <div className="map-tool-panel">
      <div className="map-tool-panel__actions">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          onClick={searchViewport}
        >
          Search current view
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isDrawing ? 'secondary' : 'outline-secondary'}
          aria-pressed={isDrawing}
          onClick={isDrawing ? spatialSearch.clear : spatialSearch.startDrawing}
        >
          {isDrawing ? 'Cancel rectangle' : 'Draw a rectangle'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={!isDrawing}
          onClick={spatialSearch.addCornerAtCenter}
        >
          Add corner at map center
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={shape === null && !isDrawing}
          onClick={spatialSearch.clear}
        >
          Clear search
        </Button>
      </div>
      <p
        className="map-tool-panel__status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {resultDescription(spatialSearch)}
      </p>
      <p className="map-tool-panel__instructions">
        Choose two corners by clicking the map or adding its center. Escape
        cancels drawing.
      </p>
      {shape === null ? null : (
        <>
          <p className="map-tool-panel__note">
            Tablets are associated with an excavation area, not an exact
            findspot coordinate.
          </p>
          <MapSpatialSearchResults
            key={resultsKey}
            findspotIds={result.findspotIds}
            findspots={findspots}
          />
        </>
      )}
    </div>
  )
}
