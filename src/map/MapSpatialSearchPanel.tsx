import React from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { buildFindspotFragmentSearchLink } from 'map/mapLinks'
import { spatialSearchDescription } from 'map/spatialSearch'
import type { SpatialSearchController } from 'map/useMapSpatialSearch'

const MAX_LISTED_FINDSPOTS = 25

interface Props {
  readonly spatialSearch: SpatialSearchController
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

  return `${spatialSearchDescription(shape)}: ${result.polygonIds.length} excavation areas; ${result.availablePolygonCount} with data available, ${result.loadingPolygonCount} loading, ${result.unavailablePolygonCount} unavailable. ${result.mappedPolygonCount} with mapped findspots, ${result.findspotIds.length} mapped findspots, ${result.accessibleFragmentCount} accessible fragments.`
}

export default function MapSpatialSearchPanel({
  spatialSearch,
}: Props): JSX.Element {
  const { shape, result, isDrawing } = spatialSearch

  return (
    <div className="map-tool-panel">
      <div className="map-tool-panel__actions">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          onClick={spatialSearch.searchViewport}
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
            Fragments are associated with an excavation area, not an exact
            findspot coordinate.
          </p>
          <ul className="map-tool-panel__findspots">
            {result.findspotIds.slice(0, MAX_LISTED_FINDSPOTS).map((id) => (
              <li key={id}>
                <Link to={buildFindspotFragmentSearchLink(id)}>
                  Fragments from findspot {id}
                </Link>
              </li>
            ))}
          </ul>
          {result.findspotIds.length > MAX_LISTED_FINDSPOTS ? (
            <p className="map-tool-panel__note">
              Showing the first {MAX_LISTED_FINDSPOTS} of{' '}
              {result.findspotIds.length} mapped findspots. A combined
              multi-findspot query needs a verified backend contract.
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
