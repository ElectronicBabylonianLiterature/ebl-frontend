import {
  type PolygonFindspotSummary,
  aggregateFindspotMapData,
} from './findspotMapData'
import { polygonHoverPreview, siteHoverPreview } from './mapHoverPreview'
import { findspotMapData } from 'test-support/map-fixtures'

const POINT = { x: 12, y: 34 }
const POLYGON = 'assur-bb6i'

function summaryFor(
  findspots: readonly ReturnType<typeof findspotMapData>[],
): PolygonFindspotSummary | undefined {
  return aggregateFindspotMapData(findspots).get(POLYGON)
}

describe('polygonHoverPreview', () => {
  it('states the counts and the evidence in four short lines', () => {
    expect(
      polygonHoverPreview(
        'bB6I',
        summaryFor([
          findspotMapData({ findspotId: 1, polygonIds: [POLYGON] }),
          findspotMapData({
            findspotId: 2,
            polygonIds: [POLYGON],
            accessibleFragmentCount: 19,
          }),
        ]),
        POINT,
      ),
    ).toEqual({
      x: 12,
      y: 34,
      title: 'bB6I',
      details: [
        '2 mapped findspots',
        '23 accessible fragments',
        'Verified-source mapping',
        'Click to inspect',
      ],
    })
  })

  it('names mixed evidence when methods disagree', () => {
    expect(
      polygonHoverPreview(
        'bB6I',
        summaryFor([
          findspotMapData({ findspotId: 1, polygonIds: [POLYGON] }),
          findspotMapData({
            findspotId: 2,
            polygonIds: [POLYGON],
            matchMethod: 'curated',
          }),
        ]),
        POINT,
      ).details,
    ).toContain('Mixed mapping evidence')
  })

  it('says plainly that an unmapped area has no findspots', () => {
    expect(polygonHoverPreview('Excavation area', undefined, POINT)).toEqual({
      x: 12,
      y: 34,
      title: 'Excavation area',
      details: ['No mapped findspots', 'Click to inspect'],
    })
  })
})

describe('siteHoverPreview', () => {
  const summary = {
    siteId: 'assur',
    siteName: 'Aššur',
    totalPolygonCount: 134,
    linkedPolygonCount: 133,
    mappedFindspotCount: 317,
    accessibleFragmentCount: 1245,
    historicalOverlayCount: 10,
  }

  it('lists linked polygons and historical maps', () => {
    expect(siteHoverPreview('Aššur', summary, POINT).details).toEqual([
      '133 linked excavation polygons',
      '10 historical maps',
      'Click to explore',
    ])
  })

  it('singularizes a lone linked polygon and map', () => {
    expect(
      siteHoverPreview(
        'Aššur',
        { ...summary, linkedPolygonCount: 1, historicalOverlayCount: 1 },
        POINT,
      ).details,
    ).toEqual([
      '1 linked excavation polygon',
      '1 historical map',
      'Click to explore',
    ])
  })

  it('omits every line the site has nothing for', () => {
    expect(
      siteHoverPreview(
        'Uruk',
        { ...summary, linkedPolygonCount: 0, historicalOverlayCount: 0 },
        POINT,
      ).details,
    ).toEqual(['Click to explore'])
    expect(siteHoverPreview('Uruk', undefined, POINT).details).toEqual([
      'Click to explore',
    ])
  })
})
