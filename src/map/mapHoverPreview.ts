import type { PolygonFindspotSummary } from './findspotMapData'
import type { SiteResearchSummary } from './mapResearchSummary'
import { mappingEvidenceOf } from './mapResearchSummary'
import {
  countLabel,
  mappingEvidenceLabel,
  pluralize,
} from './mapResearchLabels'
import type { MapHoverPreview } from './mapSelection'

const INSPECT_HINT = 'Click to inspect'
const EXPLORE_HINT = 'Click to explore'

export interface HoverPoint {
  readonly x: number
  readonly y: number
}

/**
 * Hover previews are deliberately four short lines at most: the label, what
 * is mapped, how strong the evidence is, and what a click does. No links, no
 * canonical ids, no raw response fields — everything longer belongs in the
 * inspector, which is reachable from the same click.
 */
export function polygonHoverPreview(
  title: string,
  summary: PolygonFindspotSummary | undefined,
  point: HoverPoint,
): MapHoverPreview {
  if (!summary || summary.findspotCount === 0) {
    return {
      ...point,
      title,
      details: ['No mapped findspots', INSPECT_HINT],
    }
  }

  return {
    ...point,
    title,
    details: [
      `${countLabel(summary.findspotCount, 'mapped findspot')}`,
      `${countLabel(summary.accessibleFragmentCount, 'accessible fragment')}`,
      mappingEvidenceLabel(mappingEvidenceOf(summary.findspots)),
      INSPECT_HINT,
    ],
  }
}

export function siteHoverPreview(
  title: string,
  summary: SiteResearchSummary | undefined,
  point: HoverPoint,
): MapHoverPreview {
  const details: string[] = []

  if (summary && summary.linkedPolygonCount > 0) {
    details.push(
      `${summary.linkedPolygonCount.toLocaleString('en')} linked excavation ${pluralize(
        summary.linkedPolygonCount,
        'polygon',
      )}`,
    )
  }
  if (summary && summary.historicalOverlayCount > 0) {
    details.push(countLabel(summary.historicalOverlayCount, 'historical map'))
  }
  details.push(EXPLORE_HINT)

  return { ...point, title, details }
}
