export const MAP_SITE_IDS = ['assur', 'kalhu', 'nippur', 'uruk'] as const

export type MapSiteId = (typeof MAP_SITE_IDS)[number]

export interface MapSiteDefinition {
  readonly siteId: MapSiteId
  readonly siteName: string
}

const MAP_SITES: readonly MapSiteDefinition[] = [
  { siteId: 'assur', siteName: 'Aššur' },
  { siteId: 'kalhu', siteName: 'Kalḫu' },
  { siteId: 'nippur', siteName: 'Nippur' },
  { siteId: 'uruk', siteName: 'Uruk' },
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
