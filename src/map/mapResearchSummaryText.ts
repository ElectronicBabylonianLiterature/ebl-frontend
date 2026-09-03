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

function contextLines(context: MapResearchContext): readonly string[] {
  return [
    ...section('Active visualization:', [context.visualizationLabel]),
    ...section(
      'Active filters:',
      context.siteFilter === ''
        ? []
        : [`Site name contains "${context.siteFilter}"`],
    ),
    '',
    'Map:',
    context.shareUrl,
    '',
    `Generated: ${context.generatedAt}`,
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
    `# ${summary.displayName} — ${summary.siteName}`,
    '',
    'Feature type: Excavation area',
    `Mapped findspots: ${summary.mappedFindspotCount}`,
    `Accessible fragments: ${summary.accessibleFragmentCount}`,
    `Mapping evidence: ${mappingEvidenceShortLabel(summary.mappingEvidence)}`,
    `Location precision: ${locationPrecisionLabel(summary.locationPrecision)}`,
    ...section(
      'Mapped findspots:',
      summary.findspots.map(
        (findspot) =>
          `Findspot ${findspot.findspotId} — ${countLabel(
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
