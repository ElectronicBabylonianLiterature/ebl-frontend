export const MAP_SITE_IDS = ['assur', 'kalhu', 'nippur', 'uruk'] as const

export type MapSiteId = (typeof MAP_SITE_IDS)[number]

export const MAP_SITE_POLYGON_COUNTS: Readonly<Record<MapSiteId, number>> = {
  assur: 134,
  kalhu: 12,
  nippur: 20,
  uruk: 128,
}

export interface MapSiteDefinition {
  readonly siteId: MapSiteId
  readonly siteName: string
  readonly mapDataSiteParam: string | null
}

const MAP_SITES: readonly MapSiteDefinition[] = [
  { siteId: 'assur', siteName: 'Aššur', mapDataSiteParam: 'ASSUR' },
  { siteId: 'kalhu', siteName: 'Kalḫu', mapDataSiteParam: 'KALHU' },
  { siteId: 'nippur', siteName: 'Nippur', mapDataSiteParam: 'NIPPUR' },
  { siteId: 'uruk', siteName: 'Uruk', mapDataSiteParam: 'URUK' },
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

export function findMapSiteByDataParam(
  siteParam: string,
): MapSiteDefinition | undefined {
  return MAP_SITES.find((site) => site.mapDataSiteParam === siteParam)
}
