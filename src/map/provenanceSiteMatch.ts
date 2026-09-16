import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { MapSiteCapabilities } from './mapSiteCapabilities'

/**
 * The provenance API does not expose a canonical map site id, so a provenance
 * is associated with a mapped site only by exact normalized-name equality.
 * This is a display-level association and is never used to resolve findspot,
 * polygon or fragment identity. See docs/map-multi-site-frontend-readiness.md.
 */
export function normalizeSiteName(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

export function matchSiteCapabilities(
  provenance: ProvenanceRecord | undefined,
  capabilities: readonly MapSiteCapabilities[],
): MapSiteCapabilities | undefined {
  if (!provenance) return undefined

  const normalized = normalizeSiteName(provenance.longName)
  return capabilities.find(
    (entry) => normalizeSiteName(entry.siteName) === normalized,
  )
}
