import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  assurCapabilities,
  assurSiteSummary,
  polygonSummary,
  renderInspector,
} from 'test-support/map-inspector-render'

const areaSelection = {
  type: 'excavation-area',
  polygonId: 'assur-area-a-checksum',
} as const

async function openTab(name: string): Promise<void> {
  await userEvent.click(screen.getByRole('tab', { name }))
}

function renderArea(
  overrides: Parameters<typeof renderInspector>[0] = {},
): ReturnType<typeof renderInspector> {
  return renderInspector({
    selection: areaSelection,
    selectedPolygonSite: assurCapabilities,
    selectedPolygonSummary: polygonSummary(),
    ...overrides,
  })
}

describe('site view', () => {
  it('reports linked polygon coverage without calling it corpus coverage', () => {
    renderInspector({
      selection: { type: 'site', provenanceId: 'assur' },
      selectedSiteSummary: assurSiteSummary,
    })

    expect(screen.getByText('133 of 134')).toBeInTheDocument()
    expect(screen.getByText('Excavation polygons linked')).toBeInTheDocument()
    expect(screen.getByText('Historical maps available')).toBeInTheDocument()
    expect(screen.getByText('1245')).toBeInTheDocument()
  })

  it('explains an unsupported site instead of showing zero', () => {
    renderInspector({ selection: { type: 'site', provenanceId: 'kalhu' } })

    expect(screen.queryByText('Mapped findspots')).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Fragment-linked excavation data is not yet available for this site.',
      ),
    ).toBeInTheDocument()
  })

  it('offers historical maps only when the site has them', async () => {
    const { props } = renderInspector({
      selection: { type: 'site', provenanceId: 'assur' },
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Open historical maps' }),
    )

    expect(props.onBrowseHistoricalMaps).toHaveBeenCalledWith('Aššur')
  })

  it('hides historical maps for a site without overlays', () => {
    renderInspector({ selection: { type: 'site', provenanceId: 'kalhu' } })

    expect(
      screen.queryByRole('button', { name: 'Open historical maps' }),
    ).not.toBeInTheDocument()
  })

  it('reports excavation areas as already visible', () => {
    renderInspector({
      selection: { type: 'site', provenanceId: 'assur' },
      showExcavationAreas: true,
    })

    expect(screen.getByText('Excavation areas visible')).toBeInTheDocument()
  })

  it('handles a selection for an unknown provenance', () => {
    renderInspector({ selection: { type: 'site', provenanceId: 'missing' } })

    expect(
      screen.getByRole('heading', { name: 'Selected site' }),
    ).toBeInTheDocument()
  })
})

describe('excavation-area view', () => {
  it('names the area and its site without the canonical id', () => {
    renderArea()

    expect(screen.getByRole('heading', { name: 'bB6I' })).toBeInTheDocument()
    expect(screen.getByText(/Excavation area · Aššur/)).toBeInTheDocument()
    expect(screen.queryByText('assur-area-a-checksum')).not.toBeInTheDocument()
  })

  it('badges the evidence and precision as words', () => {
    renderArea()

    expect(screen.getByText('Verified source')).toBeInTheDocument()
    expect(screen.getByText('Excavation area')).toBeInTheDocument()
  })

  it('lists findspots with an individual fragment link', async () => {
    renderArea()
    await openTab('Findspots')

    expect(screen.getByText('Findspot 123')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Findspot 123/ })).toHaveAttribute(
      'href',
      '/library/search?findspotId=123',
    )
  })

  it('states plainly when an area has no mapped findspots', async () => {
    renderArea({ selectedPolygonSummary: polygonSummary('assur-unmapped') })
    await openTab('Findspots')

    expect(
      screen.getByText(
        'No mapped findspots are linked to this excavation area.',
      ),
    ).toBeInTheDocument()
  })

  it('clears the selection', async () => {
    const { props } = renderArea()

    await userEvent.click(
      screen.getByRole('button', { name: 'Back to explore' }),
    )

    expect(props.onClearSelection).toHaveBeenCalled()
  })
})
