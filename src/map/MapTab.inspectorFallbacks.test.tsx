import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useExcavationPolygonIndex from 'map/useExcavationPolygonIndex'
import useFragmentMapData, {
  type SiteFragmentMapDataState,
} from 'map/useFragmentMapData'
import { type MapSiteId } from 'fragmentarium/domain/mapSites'
import { excavationPolygon } from 'test-support/map-fixtures'
import { makeFragmentService, renderMapTab } from 'map/MapTab.testSupport'

jest.mock('map/useFindspotMap', () => ({
  __esModule: true,
  default: function useMockFindspotMap() {
    return jest.requireActual<typeof import('react')>('react').useRef(null)
  },
}))
jest.mock('map/useExcavationPolygonIndex')
jest.mock('map/useFragmentMapData')

test.each([
  ['nippur', 'Nippur', false],
  ['unknown-site', 'unknown-site', false],
  ['nippur', 'Nippur', true],
] as const)(
  'shows an honest inspector for %s without a matching summary (%s, %s)',
  async (siteId, siteName, hasSiteData) => {
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
    await userEvent.click(
      await screen.findByRole('button', { name: 'Selected area' }),
    )
    expect(screen.getByText(siteName)).toBeVisible()
    expect(screen.queryByText('Mapped area')).not.toBeInTheDocument()
    const status = within(
      screen.getByRole('region', { name: 'Selected area' }),
    ).getByRole('status')
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
