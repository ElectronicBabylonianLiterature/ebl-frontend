import React from 'react'
import { Button } from 'react-bootstrap'
import { buildFindspotFragmentSearchLink } from './mapLinks'
import type { SpatialSearchResult, SpatialSearchShape } from './spatialSearch'
import { spatialSearchDescription } from './spatialSearch'

const MAX_LISTED_FINDSPOTS = 25

interface Props {
  readonly shape: SpatialSearchShape | null
  readonly result: SpatialSearchResult
  readonly isDrawing: boolean
  readonly onSearchViewport: () => void
  readonly onStartDrawing: () => void
  readonly onClear: () => void
}

export default function MapSpatialSearchPanel({
  shape,
  result,
  isDrawing,
  onSearchViewport,
  onStartDrawing,
  onClear,
}: Props): JSX.Element {
  return (
    <div className="map-tool-panel">
      <div className="map-tool-panel__actions">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          onClick={onSearchViewport}
        >
          Search current view
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isDrawing ? 'secondary' : 'outline-secondary'}
          aria-pressed={isDrawing}
          onClick={onStartDrawing}
        >
          {isDrawing ? 'Click the map to set corners' : 'Draw a rectangle'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={shape === null}
          onClick={onClear}
        >
          Clear search
        </Button>
      </div>
      {shape === null ? (
        <p className="map-tool-panel__status" role="status">
          Search excavation areas by the current view or a drawn rectangle.
        </p>
      ) : (
        <>
          <p className="map-tool-panel__status" role="status">
            {spatialSearchDescription(shape)}: {result.polygonIds.length}{' '}
            excavation areas, {result.mappedPolygonCount} with mapped findspots,{' '}
            {result.findspotIds.length} mapped findspots,{' '}
            {result.accessibleFragmentCount} accessible fragments.
          </p>
          <p className="map-tool-panel__note">
            Fragments are associated with an excavation area, not an exact
            findspot coordinate.
          </p>
          <ul className="map-tool-panel__findspots">
            {result.findspotIds.slice(0, MAX_LISTED_FINDSPOTS).map((id) => (
              <li key={id}>
                <a href={buildFindspotFragmentSearchLink(id)}>
                  Fragments from findspot {id}
                </a>
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
