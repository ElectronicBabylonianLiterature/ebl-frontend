export const MAP_SITE_IDS = ['assur', 'kalhu', 'nippur', 'uruk'] as const

export type MapSiteId = (typeof MAP_SITE_IDS)[number]

export interface MapSiteDefinition {
  readonly siteId: MapSiteId
  readonly siteName: string
  /**
   * Site query value accepted by `/findspots/map-data`, or `null` when the
   * frontend has no confirmed map-data endpoint for the site. Sites with
   * `null` are never requested; see docs/map-multi-site-frontend-readiness.md.
   */
  readonly mapDataSiteParam: string | null
}

const MAP_SITES: readonly MapSiteDefinition[] = [
  { siteId: 'assur', siteName: 'Aššur', mapDataSiteParam: 'ASSUR' },
  { siteId: 'kalhu', siteName: 'Kalḫu', mapDataSiteParam: null },
  { siteId: 'nippur', siteName: 'Nippur', mapDataSiteParam: null },
  { siteId: 'uruk', siteName: 'Uruk', mapDataSiteParam: null },
]

const MAP_SITES_BY_ID = new Map(MAP_SITES.map((site) => [site.siteId, site]))

export function mapSites(): readonly MapSiteDefinition[] {
  return MAP_SITES
}

export function isMapSiteId(value: unknown): value is MapSiteId {
  return typeof value === 'string' && MAP_SITES_BY_ID.has(value as MapSiteId)
}

export function findMapSite(siteId: string): MapSiteDefinition | undefined {
  return isMapSiteId(siteId) ? MAP_SITES_BY_ID.get(siteId) : undefined
}

export function mapDataSiteParam(siteId: string): string | null {
  return findMapSite(siteId)?.mapDataSiteParam ?? null
}
