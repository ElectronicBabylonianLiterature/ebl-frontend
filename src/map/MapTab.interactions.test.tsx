import { act, screen, waitFor, within } from '@testing-library/react'
import { buildFragmentSearchLink } from 'map/mapLinks'

import {
  CURRENT_LOCATION_TEST_ID,
  makeFragmentService,
  makeProvenance,
  mockCanvas,
  mockEaseTo,
  mockGetClusterExpansionZoom,
  mockGetSource,
  mockMapInstance,
  mockOff,
  mockOn,
  mockPopupAddTo,
  mockQueryRenderedFeatures,
  mockRemove,
  mockSetDOMContent,
  mockSetHTML,
  mockSetLngLat,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

describe('MapTab interactions', () => {
  beforeEach(resetMapMocks)

  it('expands a clicked cluster', async () => {
    const clusterIdProperty = 'cluster_id'
    const cluster = {
      type: 'Feature',
      properties: { [clusterIdProperty]: 42 },
      geometry: { type: 'Point', coordinates: [44.42, 32.542] },
    }
    renderMapTab(makeFragmentService([makeProvenance()]))
    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith('click', expect.any(Function))
    })

    mockQueryRenderedFeatures.mockReturnValue([cluster])
    mockGetClusterExpansionZoom.mockResolvedValue(9)
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })

    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    expect(mockGetClusterExpansionZoom).toHaveBeenCalledWith(42)
    await waitFor(() => {
      expect(mockEaseTo).toHaveBeenCalledWith({
        center: [44.42, 32.542],
        zoom: 9,
      })
    })
  })

  it('opens an unclustered findspot popup with DOM-safe content', async () => {
    const name = '<img src=x onerror=alert(1)>'
    const parent = 'Babylonia<script>xss</script>'
    const abbreviation = '<script>alert(1)</script>'
    const findspot = {
      type: 'Feature',
      properties: { name, parent, abbreviation, geometryType: 'point' },
      geometry: { type: 'Point', coordinates: [44.42, 32.542] },
    }
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    mockQueryRenderedFeatures
      .mockReturnValueOnce([])
      .mockReturnValueOnce([findspot])

    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    expect(mockSetLngLat).toHaveBeenCalledWith([44.42, 32.542])
    expect(mockSetDOMContent).toHaveBeenCalledTimes(1)
    expect(mockSetHTML).not.toHaveBeenCalled()
    expect(mockPopupAddTo).toHaveBeenCalledWith(mockMapInstance)

    const content = mockSetDOMContent.mock.calls[0][0] as HTMLElement
    document.body.append(content)
    const popup = within(content)
    expect(content.innerHTML).not.toContain('<img')
    expect(content.innerHTML).not.toContain('<script')
    expect(popup.getByText(name, { selector: 'strong' })).toHaveTextContent(
      name,
    )
    expect(popup.getByText(`${parent} · ${abbreviation}`)).toBeInTheDocument()
    expect(popup.getByText('32.54°N, 44.42°E')).toBeInTheDocument()
    expect(popup.getByText('Single point')).toBeInTheDocument()
    expect(popup.getByRole('link', { name: 'View fragments' })).toHaveAttribute(
      'href',
      buildFragmentSearchLink(name),
    )
  })

  it.each([
    ['non-finite longitude', {}, { type: 'Point', coordinates: [NaN, 32.542] }],
    ['non-finite latitude', {}, { type: 'Point', coordinates: [44.42, NaN] }],
    ['missing name', { name: undefined }, undefined],
    ['invalid parent', { parent: 42 }, undefined],
    ['invalid geometry type', { geometryType: 'line' }, undefined],
  ])('ignores popup features with %s', async (_label, properties, geometry) => {
    const findspot = {
      type: 'Feature',
      properties: {
        name: 'Babylon',
        abbreviation: 'Bab',
        geometryType: 'point',
        ...properties,
      },
      geometry: geometry ?? { type: 'Point', coordinates: [44.42, 32.542] },
    }
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    mockQueryRenderedFeatures
      .mockReturnValueOnce([])
      .mockReturnValueOnce([findspot])

    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    expect(mockSetLngLat).not.toHaveBeenCalled()
    expect(mockSetDOMContent).not.toHaveBeenCalled()
  })

  it('navigates in the app when the popup link is clicked', async () => {
    const findspot = {
      type: 'Feature',
      properties: {
        name: 'Babylon',
        abbreviation: 'BAB',
        geometryType: 'point',
      },
      geometry: { type: 'Point', coordinates: [44.42, 32.542] },
    }
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    mockQueryRenderedFeatures
      .mockReturnValueOnce([])
      .mockReturnValueOnce([findspot])
    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    const content = mockSetDOMContent.mock.calls[0][0] as HTMLElement
    document.body.append(content)
    act(() => {
      within(content).getByRole('link', { name: 'View fragments' }).click()
    })

    expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).toHaveTextContent(
      buildFragmentSearchLink('Babylon'),
    )
  })

  it('sets pointer cursor over cluster and unclustered layers', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    const clusterIdProperty = 'cluster_id'
    mockQueryRenderedFeatures.mockReturnValue([
      {
        properties: { [clusterIdProperty]: 42 },
        geometry: { type: 'Point' },
      },
    ])
    act(() => {
      triggerMapEvent('mousemove', { point: { x: 10, y: 20 } })
    })

    expect(mockCanvas).toHaveStyle({ cursor: 'pointer' })
    expect(mockQueryRenderedFeatures).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      { layers: ['ebl-clusters', 'ebl-unclustered-points'] },
    )

    mockCanvas.style.cursor = ''
    act(() => {
      triggerMapEvent('mouseenter', undefined, 'ebl-unclustered-points')
    })

    expect(mockCanvas).toHaveStyle({ cursor: 'pointer' })
  })

  it('resets cursor away from interactive layers', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')
    mockCanvas.style.cursor = 'pointer'

    mockQueryRenderedFeatures.mockReturnValue([])
    act(() => {
      triggerMapEvent('mousemove', { point: { x: 1, y: 2 } })
    })

    expect(mockCanvas).toHaveStyle({ cursor: '' })

    mockCanvas.style.cursor = 'pointer'
    act(() => {
      triggerMapEvent('mouseleave', undefined, 'ebl-clusters')
    })

    expect(mockCanvas).toHaveStyle({ cursor: '' })
  })

  it('registers and cleans up map event handlers on unmount', async () => {
    const { unmount } = renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    expect(mockOn).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith(
      'mouseenter',
      'ebl-clusters',
      expect.any(Function),
    )
    expect(mockOn).toHaveBeenCalledWith(
      'mouseleave',
      'ebl-unclustered-points',
      expect.any(Function),
    )

    unmount()

    expect(mockOff).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(mockOff).toHaveBeenCalledWith(
      'mouseleave',
      'ebl-clusters',
      expect.any(Function),
    )
    expect(mockRemove).toHaveBeenCalled()
  })
})
