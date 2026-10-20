import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MapFragmentDataState } from 'map/mapSiteCapabilities'
import {
  assurCapabilities,
  assurSiteSummary,
  polygonSummary,
  renderInspector,
} from 'test-support/map-inspector-render'

it.each<MapFragmentDataState>(['idle', 'loading', 'error', 'not-configured'])(
  'does not display or export invented area counts when data is %s',
  async (fragmentDataState) => {
    renderInspector({
      selection: {
        type: 'excavation-area',
        polygonId: 'assur-area-a-checksum',
      },
      selectedPolygonSite: { ...assurCapabilities, fragmentDataState },
      selectedPolygonSummary: polygonSummary(),
    })

    expect(screen.queryByText('Accessible tablets')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Copy research summary' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Download .md' }),
    ).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Maps' })).toBeInTheDocument()
  },
)

it('keeps site navigation available while linked data is unavailable', () => {
  renderInspector({
    selection: { type: 'site', provenanceId: 'assur' },
    capabilities: [{ ...assurCapabilities, fragmentDataState: 'error' }],
    selectedSiteSummary: assurSiteSummary,
  })

  expect(screen.queryByText('Mapped findspots')).not.toBeInTheDocument()
  expect(screen.queryByText('Accessible tablets')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Download .md' }),
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Open historical maps' }),
  ).toBeInTheDocument()
  expect(
    screen.getByText('Excavation tablet data unavailable'),
  ).toBeInTheDocument()
})

it('allows a confirmed empty response to display known zero counts', () => {
  renderInspector({
    selection: { type: 'excavation-area', polygonId: 'unmapped' },
    selectedPolygonSite: { ...assurCapabilities, fragmentDataState: 'empty' },
    selectedPolygonSummary: polygonSummary('unmapped'),
  })

  expect(screen.getByText('Accessible tablets')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Download .md' }),
  ).toBeInTheDocument()
})

it.each<MapFragmentDataState>(['idle', 'loading', 'error', 'not-configured'])(
  'keeps explorer counts unknown when linked data is %s',
  (fragmentDataState) => {
    renderInspector({
      capabilities: [{ ...assurCapabilities, fragmentDataState }],
      mappedFindspotCount: 0,
      linkedExcavationAreaCount: 0,
    })

    expect(screen.queryByText('Mapped findspots')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Linked excavation areas'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Visible provenances')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aššur/ })).toBeInTheDocument()
  },
)

it('shows confirmed empty explorer counts', () => {
  renderInspector({
    capabilities: [{ ...assurCapabilities, fragmentDataState: 'empty' }],
    mappedFindspotCount: 0,
    linkedExcavationAreaCount: 0,
  })

  expect(screen.getByText('Mapped findspots')).toBeInTheDocument()
  expect(screen.getByText('Linked excavation areas')).toBeInTheDocument()
  expect(screen.getAllByText('0')).toHaveLength(2)
})
