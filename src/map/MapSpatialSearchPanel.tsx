import React, { useMemo, useState } from 'react'
import type {
  FindspotMapData,
  FindspotMapDataStatus,
} from 'map/findspotMapData'
import { Button } from 'react-bootstrap'
import MapSpatialSearchResults from 'map/MapSpatialSearchResults'
import type { SpatialSearchResult, SpatialSearchShape } from 'map/spatialSearch'
import { spatialSearchDescription } from 'map/spatialSearch'

interface Props {
  readonly findspots: readonly FindspotMapData[]
  readonly dataStatus: FindspotMapDataStatus
  readonly cornerCount: number
  readonly onAddCornerAtCenter: () => void
  readonly shape: SpatialSearchShape | null
  readonly result: SpatialSearchResult
  readonly isDrawing: boolean
  readonly onSearchViewport: () => void
  readonly onStartDrawing: () => void
  readonly onClear: () => void
}

export default function MapSpatialSearchPanel({
  shape,
  findspots,
  dataStatus,
  cornerCount,
  onAddCornerAtCenter,
  result,
  isDrawing,
  onSearchViewport,
  onStartDrawing,
  onClear,
}: Props): JSX.Element {
  const [searchVersion, setSearchVersion] = useState(0)
  const resultsKey = useMemo(
    () => JSON.stringify([searchVersion, shape]),
    [searchVersion, shape],
  )
  const searchViewport = (): void => {
    setSearchVersion((current) => current + 1)
    onSearchViewport()
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
          onClick={isDrawing ? onClear : onStartDrawing}
        >
          {isDrawing ? 'Cancel rectangle' : 'Draw a rectangle'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={shape === null && !isDrawing}
          onClick={onClear}
        >
          Clear search
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={!isDrawing}
          onClick={onAddCornerAtCenter}
        >
          Add corner at map center
        </Button>
      </div>
      {shape === null ? (
        <p className="map-tool-panel__status" role="status">
          {isDrawing
            ? `Add corner ${cornerCount + 1} of 2. Escape cancels drawing.`
            : 'Search excavation areas by the current view or a drawn rectangle.'}
        </p>
      ) : dataStatus !== 'loaded' ? (
        <p className="map-tool-panel__status" role="status">
          Tablet data is unavailable or still loading. Search counts will appear
          after it loads.
        </p>
      ) : (
        <>
          <p className="map-tool-panel__status" role="status">
            {spatialSearchDescription(shape)}: {result.polygonIds.length}{' '}
            excavation areas, {result.mappedPolygonCount} with mapped findspots,{' '}
            {result.findspotIds.length} mapped findspots,{' '}
            {result.accessibleFragmentCount} accessible tablets.
          </p>
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
