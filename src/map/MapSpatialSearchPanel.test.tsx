import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import type { SpatialSearchController } from 'map/useMapSpatialSearch'

function controller(
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

function renderPanel(spatialSearch: SpatialSearchController): void {
  render(
    <MemoryRouter>
      <MapSpatialSearchPanel spatialSearch={spatialSearch} />
    </MemoryRouter>,
  )
}

describe('MapSpatialSearchPanel', () => {
  it('offers viewport, pointer, and keyboard-accessible rectangle searches', async () => {
    const spatialSearch = controller()
    renderPanel(spatialSearch)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Search excavation areas by the current view or a drawn rectangle.',
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText(/Choose two corners/)).toHaveTextContent(
      'Escape cancels drawing.',
    )
    expect(
      screen.getByRole('button', { name: 'Add corner at map center' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeDisabled()

    await userEvent.click(
      screen.getByRole('button', { name: 'Search current view' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Draw a rectangle' }),
    )

    expect(spatialSearch.searchViewport).toHaveBeenCalledTimes(1)
    expect(spatialSearch.startDrawing).toHaveBeenCalledTimes(1)
  })

  it('announces drawing phase and routes corner, cancel, and clear actions', async () => {
    const spatialSearch = controller({
      isDrawing: true,
      cornerCount: 1,
      addCornerAtCenter: jest.fn(),
      clear: jest.fn(),
    })
    renderPanel(spatialSearch)

    expect(screen.getByRole('status')).toHaveTextContent('Add corner 2 of 2.')

    expect(
      screen.getByRole('button', { name: 'Cancel rectangle' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Add corner at map center' }),
    ).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeEnabled()

    await userEvent.click(
      screen.getByRole('button', { name: 'Add corner at map center' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel rectangle' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(spatialSearch.addCornerAtCenter).toHaveBeenCalledTimes(1)
    expect(spatialSearch.clear).toHaveBeenCalledTimes(2)
  })

  it('announces why a zero-area second corner was rejected', () => {
    renderPanel(
      controller({
        isDrawing: true,
        cornerCount: 1,
        validationMessage:
          'Choose a second corner with a different latitude and longitude.',
      }),
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Choose a second corner with a different latitude and longitude. Add corner 2 of 2.',
    )
  })

  it('reports data completeness and exposes router-safe findspot links', () => {
    renderPanel(
      controller({
        shape: { type: 'viewport', bounds: [[43, 35, 44, 36]] },
        result: {
          polygonIds: ['a', 'b', 'c', 'd'],
          findspotIds: [0, 7],
          mappedPolygonCount: 2,
          accessibleFragmentCount: 8,
          availablePolygonCount: 2,
          loadingPolygonCount: 1,
          unavailablePolygonCount: 1,
        },
      }),
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Current map view: 4 excavation areas; 2 with data available, 1 loading, 1 unavailable. 2 with mapped findspots, 2 mapped findspots, 8 accessible fragments.',
    )
    expect(
      screen.getByRole('link', { name: 'Fragments from findspot 0' }),
    ).toHaveAttribute('href', '/library/search?findspotId=0')
    expect(
      screen.getByRole('link', { name: 'Fragments from findspot 7' }),
    ).toHaveAttribute('href', '/library/search?findspotId=7')
  })

  it('lists only the first 25 findspots and explains the truncation', () => {
    const findspotIds = Array.from({ length: 27 }, (_, index) => index)
    renderPanel(
      controller({
        shape: { type: 'bounding-box', bounds: [[43, 35, 44, 36]] },
        result: {
          polygonIds: ['a'],
          findspotIds,
          mappedPolygonCount: 1,
          accessibleFragmentCount: 27,
          availablePolygonCount: 1,
          loadingPolygonCount: 0,
          unavailablePolygonCount: 0,
        },
      }),
    )

    expect(screen.getAllByRole('link')).toHaveLength(25)
    expect(
      screen.queryByRole('link', { name: 'Fragments from findspot 25' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Showing the first 25 of 27/)).toBeVisible()
  })
})
