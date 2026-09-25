import type { PolygonResearchSummary } from 'map/mapResearchSummary'
import {
  EXCAVATION_AREA_NOTE,
  FRAGMENT_ACCESS_NOTE,
  countLabel,
  locationPrecisionLabel,
  mappingEvidenceShortLabel,
} from 'map/mapResearchLabels'

export interface MapResearchContext {
  readonly visualizationLabel: string
  readonly siteFilter: string
  readonly shareUrl: string
  readonly generatedAt: string
}

function section(title: string, lines: readonly string[]): readonly string[] {
  return lines.length === 0 ? [] : ['', title, ...lines.map((l) => `- ${l}`)]
}

const MARKDOWN_INLINE_CHARACTERS = /[\\`*_{}<>#|]|\[|\]/g

function inline(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .replace(MARKDOWN_INLINE_CHARACTERS, '\\$&')
}

function contextLines(context: MapResearchContext): readonly string[] {
  return [
    ...section('Active visualization:', [inline(context.visualizationLabel)]),
    ...section(
      'Active filters:',
      context.siteFilter === ''
        ? []
        : [`Site name contains "${inline(context.siteFilter)}"`],
    ),
    '',
    'Map:',
    inline(context.shareUrl),
    '',
    `Generated: ${inline(context.generatedAt)}`,
    '',
    FRAGMENT_ACCESS_NOTE,
    EXCAVATION_AREA_NOTE,
  ]
}

export function polygonResearchMarkdown(
  summary: PolygonResearchSummary,
  context: MapResearchContext,
): string {
  return [
    `# ${inline(summary.displayName)} — ${inline(summary.siteName)}`,
    '',
    'Feature type: Excavation area',
    `Site ID: ${inline(summary.siteId)}`,
    `Polygon ID: ${inline(summary.polygonId)}`,
    ...(summary.areaSquareKm === null || !Number.isFinite(summary.areaSquareKm)
      ? []
      : [`Mapped area: ${summary.areaSquareKm.toFixed(3)} km²`]),
    `Mapped findspots: ${summary.mappedFindspotCount}`,
    `Accessible fragments: ${summary.accessibleFragmentCount}`,
    `Mapping evidence: ${mappingEvidenceShortLabel(summary.mappingEvidence)}`,
    `Location precision: ${locationPrecisionLabel(summary.locationPrecision)}`,
    ...section(
      'Mapped findspots:',
      summary.findspots.map(
        (findspot) =>
          `Findspot ${findspot.findspotId}${
            findspot.area === null ? '' : ` (${inline(findspot.area)})`
          } — ${countLabel(
            findspot.accessibleFragmentCount,
            'accessible fragment',
          )}`,
      ),
    ),
    ...contextLines(context),
  ].join('\n')
}

const UNSAFE_FILENAME_CHARACTERS = /[^a-z0-9]+/gi

export function researchSummaryFileName(
  title: string,
  generatedAt: string,
): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(UNSAFE_FILENAME_CHARACTERS, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60)
  const stamp = generatedAt.replace(/[:.]/g, '-')

  return `ebl-map-${slug === '' ? 'summary' : slug}-${stamp}.md`
}
