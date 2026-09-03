import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { historicalMapOverlay } from 'test-support/map-fixtures'
import type { HistoricalMapOverlaySeries } from './historicalOverlays'
import ActiveHistoricalMaps, {
  type SeriesActions,
  renderSeriesControls,
} from './MapControlsSeries'

const overlayA = historicalMapOverlay({
  id: 'a',
  shortTitle: 'Plate A',
  seriesTitle: 'Preusser 1954',
  plateLabel: 'Tf. 1',
})
const overlayB = historicalMapOverlay({
  id: 'b',
  shortTitle: 'Plate B',
  seriesTitle: 'Preusser 1954',
  plateLabel: 'Tf. 2',
})
const series: HistoricalMapOverlaySeries = {
  seriesId: 'preusser-1954',
  seriesTitle: 'Preusser 1954',
  overlays: [overlayA, overlayB],
}

function actions(): SeriesActions {
  return {
    setOverlayActive: jest.fn(),
    showSeries: jest.fn(),
    hideSeries: jest.fn(),
    zoomToSeries: jest.fn(),
  }
}

describe('renderSeriesControls', () => {
  it('renders nothing when no overlay in the series is visible', () => {
    const { container } = render(
      <>{renderSeriesControls(series, [], new Set(), actions())}</>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the active count and each overlay checkbox', () => {
    render(
      <>
        {renderSeriesControls(
          series,
          series.overlays,
          new Set(['a']),
          actions(),
        )}
      </>,
    )

    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Tf\. 1/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Tf\. 2/ })).not.toBeChecked()
  })

  it('wires show, hide, zoom and the per-overlay checkbox', async () => {
    const seriesActions = actions()
    render(
      <>
        {renderSeriesControls(
          series,
          series.overlays,
          new Set(),
          seriesActions,
        )}
      </>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Show series' }))
    expect(seriesActions.showSeries).toHaveBeenCalledWith('preusser-1954')

    await userEvent.click(screen.getByRole('button', { name: 'Hide series' }))
    expect(seriesActions.hideSeries).toHaveBeenCalledWith('preusser-1954')

    await userEvent.click(screen.getByRole('button', { name: 'Zoom' }))
    expect(seriesActions.zoomToSeries).toHaveBeenCalledWith('preusser-1954')

    await userEvent.click(screen.getByRole('checkbox', { name: /Tf\. 1/ }))
    expect(seriesActions.setOverlayActive).toHaveBeenCalledWith(overlayA, true)
  })
})

describe('ActiveHistoricalMaps', () => {
  it('renders nothing when no overlay is active', () => {
    const { container } = render(
      <ActiveHistoricalMaps
        activeOverlayEntries={[]}
        setOverlayActive={jest.fn()}
        setOverlayOpacity={jest.fn()}
        zoomToActiveOverlays={jest.fn()}
        zoomToOverlay={jest.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('lists each active overlay with its opacity and actions', async () => {
    const setOverlayActive = jest.fn()
    const setOverlayOpacity = jest.fn()
    const zoomToActiveOverlays = jest.fn()
    const zoomToOverlay = jest.fn()

    render(
      <ActiveHistoricalMaps
        activeOverlayEntries={[
          { overlay: overlayA, opacity: 0.5, visible: true },
        ]}
        setOverlayActive={setOverlayActive}
        setOverlayOpacity={setOverlayOpacity}
        zoomToActiveOverlays={zoomToActiveOverlays}
        zoomToOverlay={zoomToOverlay}
      />,
    )

    expect(screen.getByText('50%')).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Zoom to active maps' }),
    )
    expect(zoomToActiveOverlays).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Zoom' }))
    expect(zoomToOverlay).toHaveBeenCalledWith(overlayA)

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(setOverlayActive).toHaveBeenCalledWith(overlayA, false)
  })

  it('disables zoom for an overlay without bounds and hides an unsafe source link', () => {
    const overlayWithoutBounds = historicalMapOverlay({
      id: 'c',
      bounds: undefined,
      sourceUrl: 'javascript:alert(1)',
    })

    render(
      <ActiveHistoricalMaps
        activeOverlayEntries={[
          { overlay: overlayWithoutBounds, opacity: 1, visible: true },
        ]}
        setOverlayActive={jest.fn()}
        setOverlayOpacity={jest.fn()}
        zoomToActiveOverlays={jest.fn()}
        zoomToOverlay={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Zoom' })).toBeDisabled()
    expect(
      screen.queryByRole('link', { name: 'Source' }),
    ).not.toBeInTheDocument()
  })

  it('shows a source link for a safe overlay url', () => {
    const overlayWithSource = historicalMapOverlay({
      id: 'd',
      sourceUrl: 'https://example.test/plate',
    })

    render(
      <ActiveHistoricalMaps
        activeOverlayEntries={[
          { overlay: overlayWithSource, opacity: 1, visible: true },
        ]}
        setOverlayActive={jest.fn()}
        setOverlayOpacity={jest.fn()}
        zoomToActiveOverlays={jest.fn()}
        zoomToOverlay={jest.fn()}
      />,
    )

    expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute(
      'href',
      'https://example.test/plate',
    )
  })
})
