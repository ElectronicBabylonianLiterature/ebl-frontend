import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapLayerPanel from 'map/MapLayerPanel'
import type { MapSiteId } from 'map/mapSites'
import type { SiteFragmentMapDataState } from 'map/useFragmentMapData'
import { excavationPolygon } from 'test-support/map-fixtures'

const polygon = excavationPolygon({ polygonId: 'area-a', siteId: 'assur' })

function panelState(): React.ComponentProps<typeof MapLayerPanel>['state'] {
  return {
    experience: {
      setSelection: jest.fn(),
      setShowExcavationAreas: jest.fn(),
    },
    selectedPolygon: null,
    excavationPolygons: [polygon],
    showExcavationAreas: true,
    canShowExcavationAreas: true,
    fragmentMapData: {
      sites: new Map(),
      findspots: [],
      polygonSummaries: new Map(),
    },
  }
}

it('keeps keyboard area selection, deselection and layer controls connected', async () => {
  const state = panelState()
  render(<MapLayerPanel state={state} />)

  expect(screen.queryByRole('region')).not.toBeInTheDocument()
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Select excavation area' }),
    polygon.polygonId,
  )
  expect(state.experience.setSelection).toHaveBeenLastCalledWith({
    type: 'excavation-area',
    polygonId: polygon.polygonId,
  })
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Select excavation area' }),
    '',
  )
  expect(state.experience.setSelection).toHaveBeenLastCalledWith(null)
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Excavation areas' }),
  )
  expect(state.experience.setShowExcavationAreas).toHaveBeenCalledWith(false)
})

it.each(['assur', 'unknown-site'])(
  'keeps selected areas without linked configuration visible for %s',
  async (siteId) => {
    const state = panelState()
    render(
      <MapLayerPanel
        state={{ ...state, selectedPolygon: { ...polygon, siteId } }}
      />,
    )

    expect(
      screen.getByText(
        'No linked tablet data is configured for this site yet.',
      ),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(state.experience.setSelection).toHaveBeenCalledWith(null)
  },
)

it('shows the selected site failure instead of a different site empty result', () => {
  const state = panelState()
  const sites = new Map<MapSiteId, SiteFragmentMapDataState>([
    [
      'assur' as const,
      { status: 'error' as const, findspots: [], polygonSummaries: new Map() },
    ],
    [
      'kalhu' as const,
      {
        status: 'loaded-empty' as const,
        findspots: [],
        polygonSummaries: new Map(),
      },
    ],
  ])
  render(
    <MapLayerPanel
      state={{
        ...state,
        selectedPolygon: polygon,
        fragmentMapData: { ...state.fragmentMapData, sites },
      }}
    />,
  )

  expect(
    screen.getByText('Linked tablet data is unavailable right now.'),
  ).toBeInTheDocument()
  expect(
    screen.queryByText('No tablets are linked to this excavation area.'),
  ).not.toBeInTheDocument()
})
