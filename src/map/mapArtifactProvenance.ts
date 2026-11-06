import manifest from 'map/mapArtifactProvenance.json'
import { mapDataSiteParam } from 'map/mapSites'

interface SiteProvenance {
  readonly artifactSourceRevision: string | null
  readonly mappingSourceRevisions: readonly string[]
  readonly artifactManifestSha256: string | null
}

const sites: Readonly<Record<string, SiteProvenance>> = manifest.sites
const files: Readonly<Record<string, string>> = manifest.files
export const MAP_ARTIFACT_PROVENANCE = manifest

export function exportPolygonProvenance(siteId: string): {
  readonly canonicalSiteId: string | null
  readonly artifactSourceRevision: string | null
  readonly mappingSourceRevisions: readonly string[]
  readonly artifactManifestSha256: string | null
  readonly polygonGeometrySha256: string | null
} {
  const canonicalSiteId = mapDataSiteParam(siteId)
  const site = canonicalSiteId === null ? undefined : sites[canonicalSiteId]
  return {
    canonicalSiteId,
    artifactSourceRevision: site?.artifactSourceRevision ?? null,
    mappingSourceRevisions: site?.mappingSourceRevisions ?? [],
    artifactManifestSha256: site?.artifactManifestSha256 ?? null,
    polygonGeometrySha256: files[siteId + '.geojson'] ?? null,
  }
}
