import React from 'react'
import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import buildMapToolPanels from 'map/mapToolPanels'
import useMapTabState, { type MapTabState } from 'map/useMapTabState'
import { serviceReturning } from 'map/useFragmentMapData.testSupport'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import { toExportRows } from 'map/mapExportData'
import { downloadExportCsv, downloadExportGeoJson } from 'map/mapExportDownload'
import { excavationPolygon } from 'test-support/map-fixtures'
import type { MapPanelDefinition } from 'map/MapToolbar'

jest.mock('maplibre-gl')
jest.mock('map/useExcavationPolygonIndex', () => {
  const state = { index: new Map(), isLoaded: false, error: null }
  return { __esModule: true, default: () => state }
})
jest.mock('map/mapExportDownload', () => ({
  downloadExportCsv: jest.fn(),
  downloadExportGeoJson: jest.fn(),
}))

const originalUrl = window.location.href

afterEach(() => {
  jest.restoreAllMocks()
  jest.clearAllMocks()
  window.history.replaceState(null, '', originalUrl)
})

function mapState(): MapTabState {
  const service = serviceReturning(() => Promise.resolve([]))
  const { result } = renderHook(() => useMapTabState(service, []), {
    wrapper: MemoryRouter,
  })
  return result.current
}

function panel(
  state: MapTabState,
  id: 'inspector' | 'export',
): MapPanelDefinition {
  const definition = buildMapToolPanels(state, jest.fn()).find(
    (entry) => entry.id === id,
  )
  if (!definition) throw new Error(`Missing ${id} panel`)
  return definition
}

it('renders a truthful empty inspector when no area is selected', () => {
  const inspector = panel(mapState(), 'inspector')

  expect(inspector.isSupported).toBe(false)
  render(<MemoryRouter>{inspector.render()}</MemoryRouter>)

  expect(screen.getByText('No excavation area is selected.')).toBeVisible()
  expect(screen.queryByText('Mapped findspots')).not.toBeInTheDocument()
})

it.each([
  ['assur', 'Aššur'],
  ['unregistered-site', 'unregistered-site'],
])(
  'keeps an unconfigured selected site %s identifiable',
  (siteId, siteName) => {
    const state = {
      ...mapState(),
      selectedPolygon: excavationPolygon({ siteId }),
      fragmentMapData: {
        sites: new Map(),
        findspots: [],
        polygonSummaries: new Map(),
      },
    }
    const inspector = panel(state, 'inspector')

    expect(inspector.isSupported).toBe(true)
    render(<MemoryRouter>{inspector.render()}</MemoryRouter>)

    expect(screen.getByText(siteName)).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Linked fragment data is not configured for this site.',
    )
    expect(screen.queryByText('Mapped findspots')).not.toBeInTheDocument()
  },
)

it('builds current research metadata at each download instead of panel creation', async () => {
  const state = mapState()
  const polygon = excavationPolygon({ siteId: 'assur', polygonId: 'assur-a' })
  const sites: FragmentMapDataState['sites'] = new Map([
    [
      'assur',
      { status: 'loaded-empty', findspots: [], polygonSummaries: new Map() },
    ],
    ['uruk', { status: 'error', findspots: [], polygonSummaries: new Map() }],
  ])
  const scope = { type: 'selection' as const, polygonId: polygon.polygonId }
  const rows = toExportRows([polygon], sites)
  const exports = panel(
    {
      ...state,
      canShowExcavationAreas: true,
      experience: { ...state.experience, filter: 'Aššur' },
      visualization: { ...state.visualization, effectiveMode: 'count' },
      fragmentMapData: { ...state.fragmentMapData, sites },
      exportView: { rows, scope },
    },
    'export',
  )
  render(<MemoryRouter>{exports.render()}</MemoryRouter>)
  const timestamp = jest.spyOn(Date.prototype, 'toISOString')
  const firstTime = '2026-10-20T10:00:00.000Z'
  timestamp.mockReturnValue(firstTime)
  window.history.replaceState(null, '', '/tools/map?mv=1&findspot=first')
  const firstUrl = window.location.href

  await userEvent.click(
    screen.getByRole('button', { name: 'Download GeoJSON' }),
  )

  const context = {
    visualization: 'count',
    siteFilter: 'Aššur',
    scope,
    dataStatuses: { assur: 'loaded-empty', uruk: 'error' },
  }
  expect(downloadExportGeoJson).toHaveBeenCalledWith(rows, {
    ...context,
    shareUrl: firstUrl,
    exportedAt: firstTime,
  })
  const secondTime = '2026-10-20T10:01:00.000Z'
  timestamp.mockReturnValue(secondTime)
  window.history.replaceState(null, '', '/tools/map?mv=1&findspot=second')

  await userEvent.click(screen.getByRole('button', { name: 'Download CSV' }))

  expect(downloadExportCsv).toHaveBeenCalledWith(rows, {
    ...context,
    shareUrl: window.location.href,
    exportedAt: secondTime,
  })
})
