import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import type { FindspotMapData } from 'map/findspotMapData'

export type SpatialSearchPanelProps = React.ComponentProps<
  typeof MapSpatialSearchPanel
>

export function panelProps(
  overrides: Partial<SpatialSearchPanelProps> = {},
): SpatialSearchPanelProps {
  return {
    shape: null,
    result: {
      polygonIds: [],
      findspotIds: [],
      mappedPolygonCount: 0,
      accessibleFragmentCount: 0,
    },
    findspots: [],
    dataStatus: 'loaded',
    isDrawing: false,
    cornerCount: 0,
    onAddCornerAtCenter: jest.fn(),
    onClear: jest.fn(),
    onStartDrawing: jest.fn(),
    onSearchViewport: jest.fn(),
    ...overrides,
  }
}

export function panel(
  properties: SpatialSearchPanelProps,
  findspots: readonly FindspotMapData[] = [],
): JSX.Element {
  return (
    <MemoryRouter>
      <MapSpatialSearchPanel {...properties} findspots={findspots} />
    </MemoryRouter>
  )
}

export function renderPanel(
  properties: SpatialSearchPanelProps,
  findspots: readonly FindspotMapData[] = [],
): ReturnType<typeof render> {
  return render(panel(properties, findspots))
}
