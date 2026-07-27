import type { MapGeoJSONFeature } from 'maplibre-gl'
import { createExcavationAreaPopup } from './createExcavationAreaPopup'
import type { FindspotMapData, PolygonFindspotSummary } from './findspotMapData'
import { buildFindspotFragmentSearchLink } from './mapLinks'

function makeFeature(
  overrides: Record<string, unknown> = {},
): MapGeoJSONFeature {
  return {
    type: 'Feature',
    properties: {
      id: 'assur-area-a-checksum',
      name: 'Area A',
      siteName: 'Aššur',
      ...overrides,
    },
    geometry: { type: 'Polygon', coordinates: [] },
    layer: { id: 'test-layer', type: 'fill' },
    source: 'test-source',
    sourceLayer: undefined,
    state: {},
    id: 1,
  } as unknown as MapGeoJSONFeature
}

function makeFindspot(
  overrides: Partial<FindspotMapData> = {},
): FindspotMapData {
  return {
    findspotId: 123,
    siteId: 'ASSUR',
    siteName: 'Aššur',
    polygonIds: ['assur-area-a-checksum'],
    accessibleFragmentCount: 5,
    locationPrecision: 'excavation-area',
    matchMethod: 'verified-source',
    sector: null,
    area: 'Area A',
    building: null,
    room: null,
    ...overrides,
  }
}

function makeSummary(
  overrides: Partial<PolygonFindspotSummary> = {},
): PolygonFindspotSummary {
  const findspot = makeFindspot()
  return {
    polygonId: 'assur-area-a-checksum',
    findspotIds: [findspot.findspotId],
    findspotCount: 1,
    accessibleFragmentCount: findspot.accessibleFragmentCount,
    findspots: [findspot],
    ...overrides,
  }
}

function htmlOf(node: Node): string {
  if (node instanceof HTMLElement) {
    return node.outerHTML
  }
  return node.textContent ?? ''
}

describe('createExcavationAreaPopup', () => {
  it('returns null when feature lacks siteName', () => {
    expect(
      createExcavationAreaPopup(
        makeFeature({ siteName: undefined }),
        undefined,
        'loaded',
      ),
    ).toBeNull()
  })

  it('returns null when feature lacks name', () => {
    expect(
      createExcavationAreaPopup(
        makeFeature({ name: undefined }),
        undefined,
        'loaded',
      ),
    ).toBeNull()
  })

  it('shows loading state when map data is loading', () => {
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary(),
      'loading',
    )
    expect(popup).not.toBeNull()
    expect(popup!).toHaveTextContent(/Fragment counts loading/)
  })

  it('shows loading state when map data is idle', () => {
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary(),
      'idle',
    )
    expect(popup).not.toBeNull()
    expect(popup!).toHaveTextContent(/Fragment counts loading/)
  })

  it('shows error state when map data errored', () => {
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary(),
      'error',
    )
    expect(popup).not.toBeNull()
    expect(popup!).toHaveTextContent(/Fragment counts unavailable/)
    expect(popup!).not.toHaveTextContent(/Network/)
  })

  it('shows no mapped findspots when summary is undefined', () => {
    const popup = createExcavationAreaPopup(makeFeature(), undefined, 'loaded')
    expect(popup).not.toBeNull()
    expect(popup!).toHaveTextContent(/No mapped findspots/)
  })

  it('shows mapped findspot count and per-findspot links', () => {
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary({ accessibleFragmentCount: 18, findspotCount: 1 }),
      'loaded',
    )
    expect(popup).not.toBeNull()
    const html = htmlOf(popup!)
    expect(html).toContain('18 accessible fragments from 1 mapped findspot')
    expect(html).toContain(buildFindspotFragmentSearchLink(123))
    expect(html).toContain('Findspot 123')
  })

  it('shows zero accessible fragments with findspot links', () => {
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary({ accessibleFragmentCount: 0, findspotCount: 1 }),
      'loaded',
    )
    expect(popup).not.toBeNull()
    const html = htmlOf(popup!)
    expect(html).toContain('0 accessible fragments from 1 mapped findspot')
    expect(html).toContain(buildFindspotFragmentSearchLink(123))
  })

  it('shows several findspots sharing a polygon', () => {
    const findspotA = makeFindspot({
      findspotId: 10,
      accessibleFragmentCount: 3,
    })
    const findspotB = makeFindspot({
      findspotId: 11,
      accessibleFragmentCount: 0,
    })
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary({
        findspotIds: [10, 11],
        findspotCount: 2,
        accessibleFragmentCount: 3,
        findspots: [findspotA, findspotB],
      }),
      'loaded',
    )
    expect(popup).not.toBeNull()
    const html = htmlOf(popup!)
    expect(html).toContain('3 accessible fragments from 2 mapped findspots')
    expect(html).toContain(buildFindspotFragmentSearchLink(10))
    expect(html).toContain(buildFindspotFragmentSearchLink(11))
    expect(html).toContain('Findspot 10')
    expect(html).toContain('Findspot 11')
  })

  it('uses textContent not innerHTML (no XSS from feature properties)', () => {
    const popup = createExcavationAreaPopup(
      makeFeature({
        name: '<img src=x onerror=alert(1)>',
        siteName: '<script>alert(1)</script>',
      }),
      makeSummary(),
      'loaded',
    )
    expect(popup).not.toBeNull()
    const html = htmlOf(popup!)
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<script')
    expect(popup!).toHaveTextContent(/<img src=x onerror=alert\(1\)>/)
    expect(popup!).toHaveTextContent(/<script>alert\(1\)<\/script>/)
  })

  it('includes browse historical maps button', () => {
    const browseMock = jest.fn()
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary(),
      'loaded',
      browseMock,
    )
    expect(popup).not.toBeNull()
    const html = htmlOf(popup!)
    expect(html).toContain('Browse historical maps for Aššur')
    expect(html).toContain('btn-outline-secondary')

    const button = popup!.querySelector('button')
    expect(button).not.toBeNull()
    button!.click()
    expect(browseMock).toHaveBeenCalledWith('Aššur')
  })

  it('omits browse button when callback is absent', () => {
    const popup = createExcavationAreaPopup(
      makeFeature(),
      makeSummary(),
      'loaded',
    )
    expect(popup).not.toBeNull()
    expect(popup!.querySelector('button')).toBeNull()
  })

  it('does not expose polygon ID in popup', () => {
    const popup = createExcavationAreaPopup(
      makeFeature({ id: 'assur-area-a-checksum' }),
      makeSummary(),
      'loaded',
    )
    expect(popup).not.toBeNull()
    expect(popup!).not.toHaveTextContent(/assur-area-a-checksum/)
    expect(popup!).not.toHaveTextContent(/Polygon ID/)
  })
})
