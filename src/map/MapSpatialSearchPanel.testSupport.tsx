import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import type { FindspotMapData } from 'map/findspotMapData'
import type { SpatialSearchController } from 'map/useMapSpatialSearch'

export function controller(
  overrides: Partial<SpatialSearchController> = {},
): SpatialSearchController {
  return {
    shape: null,
    result: {
      polygonIds: [],
      findspotIds: [],
      mappedPolygonCount: 0,
      accessibleFragmentCount: 0,
      availablePolygonCount: 0,
      loadingPolygonCount: 0,
      unavailablePolygonCount: 0,
    },
    isDrawing: false,
    cornerCount: 0,
    validationMessage: null,
    searchViewport: jest.fn(),
    startDrawing: jest.fn(),
    addCornerAtCenter: jest.fn(),
    clear: jest.fn(),
    ...overrides,
  }
}

export function panel(
  spatialSearch: SpatialSearchController,
  findspots: readonly FindspotMapData[] = [],
): JSX.Element {
  return (
    <MemoryRouter>
      <MapSpatialSearchPanel
        spatialSearch={spatialSearch}
        findspots={findspots}
      />
    </MemoryRouter>
  )
}

export function renderPanel(
  spatialSearch: SpatialSearchController,
  findspots: readonly FindspotMapData[] = [],
): RenderResult {
  return render(panel(spatialSearch, findspots))
}
