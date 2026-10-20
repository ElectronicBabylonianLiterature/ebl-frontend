import { findspotLabel } from 'map/findspotLabel'
import type {
  PolygonResearchSummary,
  SiteResearchSummary,
} from 'map/mapResearchSummary'
import {
  EXCAVATION_AREA_NOTE,
  FRAGMENT_ACCESS_NOTE,
  LINKED_POLYGON_LABEL,
  countLabel,
  linkedPolygonSentence,
  locationPrecisionLabel,
  mappingEvidenceShortLabel,
} from 'map/mapResearchLabels'

export interface MapResearchContext {
  readonly visualizationLabel: string
  readonly activeOverlayTitles: readonly string[]
  readonly isTerrainEnabled: boolean
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
    ...section(
      'Active historical maps:',
      context.activeOverlayTitles.map(inline),
    ),
    ...section('Active visualization:', [inline(context.visualizationLabel)]),
    ...section(
      'Active filters:',
      context.siteFilter === ''
        ? []
        : [`Site name contains "${inline(context.siteFilter)}"`],
    ),
    ...section('Terrain:', [context.isTerrainEnabled ? 'On' : 'Off']),
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

/**
 * A plain-Markdown record of exactly what is on screen. It never states a
 * value the current view does not already show, and it carries the share URL
 * so the same camera, filters and overlays can be reproduced.
 */
export function polygonResearchMarkdown(
  summary: PolygonResearchSummary,
  context: MapResearchContext,
): string {
  return [
    `# ${inline(summary.displayName)} — ${inline(summary.siteName)}`,
    '',
    'Feature type: Excavation area',
    `Mapped findspots: ${summary.mappedFindspotCount}`,
    `Accessible tablets: ${summary.accessibleFragmentCount}`,
    `Mapping evidence: ${mappingEvidenceShortLabel(summary.mappingEvidence)}`,
    `Location precision: ${locationPrecisionLabel(summary.locationPrecision)}`,
    ...section(
      'Mapped findspots:',
      summary.findspots.map(
        (findspot) =>
          `${inline(findspotLabel(findspot))} — ${countLabel(
            findspot.accessibleFragmentCount,
            'accessible tablet',
          )}`,
      ),
    ),
    ...contextLines(context),
  ].join('\n')
}

export function siteResearchMarkdown(
  summary: SiteResearchSummary,
  context: MapResearchContext,
): string {
  return [
    `# ${inline(summary.siteName)}`,
    '',
    'Feature type: Site',
    `${LINKED_POLYGON_LABEL}: ${linkedPolygonSentence(
      summary.linkedPolygonCount,
      summary.totalPolygonCount,
    )}`,
    `Mapped findspots: ${summary.mappedFindspotCount}`,
    `Accessible tablets: ${summary.accessibleFragmentCount}`,
    `Historical maps available: ${summary.historicalOverlayCount}`,
    ...contextLines(context),
  ].join('\n')
}

const UNSAFE_FILENAME_CHARACTERS = /[^a-z0-9]+/gi

/**
 * Transliteration is not attempted: a name such as "Aššur" reduces to its
 * ASCII skeleton and, failing that, to a stable generic stem, so the download
 * never produces a name the filesystem or the browser has to repair.
 */
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
