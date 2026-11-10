import fs from 'fs'
import path from 'path'
import {
  MAP_ARTIFACT_PROVENANCE,
  exportPolygonProvenance,
} from 'map/mapArtifactProvenance'
import {
  buildExportGeoJson,
  toExportRows,
  type MapExportContext,
} from 'map/mapExportData'
import { buildExportCsv } from 'map/mapExportCsv'
import { excavationPolygon } from 'test-support/map-fixtures'

it('bundles exactly the generated public manifest used by the canonical geometry', () => {
  expect(MAP_ARTIFACT_PROVENANCE).toEqual(
    JSON.parse(
      fs.readFileSync(
        path.resolve(
          __dirname,
          '../../public/map-data/findspots/manifest.json',
        ),
        'utf8',
      ),
    ),
  )
})

it.each(['assur', 'kalhu', 'nippur', 'uruk'])(
  'exports canonical API identity and actual source revisions for %s',
  (siteId) => {
    const provenance = exportPolygonProvenance(siteId)
    expect(provenance.canonicalSiteId).toBe(siteId.toUpperCase())
    expect(provenance.mappingSourceRevisions.length).toBeGreaterThan(0)
    expect(provenance.artifactSourceRevision).not.toBeNull()
    expect(provenance.polygonGeometrySha256).toMatch(/^[0-9a-f]{64}$/)
  },
)

it('keeps unknown provenance null instead of inventing a revision', () => {
  expect(exportPolygonProvenance('unknown')).toEqual({
    canonicalSiteId: null,
    artifactSourceRevision: null,
    mappingSourceRevisions: [],
    artifactManifestSha256: null,
    artifactContractRevision: null,
    polygonGeometrySha256: null,
  })
})

it('includes source revisions alongside caller-scoped unknown data, active filters and timestamps in both export formats', () => {
  const polygon = excavationPolygon()
  const rows = toExportRows([polygon], new Map())
  const context: MapExportContext = {
    visualization: 'count',
    siteFilter: 'Assur',
    shareUrl: 'https://example.org/tools/map?mv=1&findspot=Assur',
    exportedAt: '2026-11-06T12:00:00.000Z',
    scope: { type: 'selection', polygonId: polygon.polygonId },
    dataStatuses: { assur: 'not-configured' },
  }
  const collection = buildExportGeoJson(rows, context)
  expect(collection.metadata.artifactProvenance).toEqual(
    MAP_ARTIFACT_PROVENANCE,
  )
  expect(collection.metadata).toMatchObject({
    siteFilter: context.siteFilter,
    exportedAt: context.exportedAt,
    dataStatuses: context.dataStatuses,
  })
  expect(collection.features[0]).toMatchObject({
    geometry: polygon.geometry,
    properties: {
      canonicalSiteId: 'ASSUR',
      mappedFindspotCount: null,
      accessibleFragmentCount: null,
      artifactSourceRevision:
        MAP_ARTIFACT_PROVENANCE.sites.ASSUR.artifactSourceRevision,
    },
  })
  const csv = buildExportCsv(rows, context)
  expect(csv).toContain(
    'artifactSourceRevision,mappingSourceRevisions,artifactManifestSha256,polygonGeometrySha256',
  )
  expect(csv).toContain(
    MAP_ARTIFACT_PROVENANCE.sites.ASSUR.artifactSourceRevision,
  )
  expect(csv).toContain(context.exportedAt)
})
