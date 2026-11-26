import { screen, within } from '@testing-library/react'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import useFragmentMapData, {
  type SiteFragmentMapDataState,
} from 'map/domain/useFragmentMapData'
import { type MapSiteId } from 'fragmentarium/domain/mapSites'
import { excavationPolygon } from 'test-support/map-fixtures'
import { makeFragmentService, renderMapTab } from 'map/ui/MapTab.testSupport'

jest.mock('map/maplibre/useFindspotMap', () => ({
  __esModule: true,
  default: () => ({ current: null }),
}))
jest.mock('map/maplibre/useExcavationPolygonIndex')
jest.mock('map/domain/useFragmentMapData')

test.each([
  ['nippur', false],
  ['unknown-site', false],
  ['nippur', true],
] as const)(
  'shows an honest inspector for %s without a matching summary (site data: %s)',
  async (siteId, hasSiteData) => {
    const polygon = excavationPolygon({
      siteId,
      polygonId: 'area-a',
      name: null,
      areaSquareKm: null,
    })
    const mockIndex = useExcavationPolygonIndex as jest.MockedFunction<
      typeof useExcavationPolygonIndex
    >
    mockIndex.mockReturnValue({
      index: new Map([[siteId, [polygon]]]),
      isLoaded: true,
      retry: jest.fn(),
      error: null,
    })
    const sites = new Map<MapSiteId, SiteFragmentMapDataState>()
    if (hasSiteData)
      sites.set('nippur', {
        status: 'loaded-empty',
        findspots: [],
        polygonSummaries: new Map(),
      })
    const mockData = useFragmentMapData as jest.MockedFunction<
      typeof useFragmentMapData
    >
    mockData.mockReturnValue({
      sites,
      findspots: [],
      polygonSummaries: new Map(),
    })
    renderMapTab(
      makeFragmentService([]),
      '/tools/map?mv=1&selected=area%3Aarea-a',
    )
    const inspector = within(
      await screen.findByRole('region', { name: 'Location details' }),
    )
    expect(
      inspector.getByRole('heading', {
        name: siteId === 'nippur' ? 'Nippur' : 'Location details',
      }),
    ).toBeVisible()
    expect(inspector.getByRole('tab', { name: 'Overview' })).toBeVisible()
    expect(inspector.queryByText('Mapped area')).not.toBeInTheDocument()
    const status = inspector.getByRole('status')
    if (hasSiteData)
      expect(status).toHaveTextContent(
        '0 accessible tablets across 0 findspots.',
      )
    else
      expect(status).toHaveTextContent(
        'Linked tablet data is not configured for this site.',
      )
  },
)
