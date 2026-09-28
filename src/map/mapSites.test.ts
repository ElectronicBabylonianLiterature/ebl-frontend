import { MAP_SITE_IDS, mapDataSiteParam, mapSites } from 'map/mapSites'

describe('mapSites linkage configuration', () => {
  it('configures the verified backend endpoint for all four sites', () => {
    expect(
      mapSites().map(({ siteId, mapDataSiteParam }) => [
        siteId,
        mapDataSiteParam,
      ]),
    ).toEqual([
      ['assur', 'ASSUR'],
      ['kalhu', 'KALHU'],
      ['nippur', 'NIPPUR'],
      ['uruk', 'URUK'],
    ])
    expect(MAP_SITE_IDS.every((siteId) => mapDataSiteParam(siteId))).toBe(true)
  })

  it('rejects unknown sites rather than forwarding arbitrary parameters', () => {
    expect(mapDataSiteParam('babylon')).toBeNull()
  })
})
