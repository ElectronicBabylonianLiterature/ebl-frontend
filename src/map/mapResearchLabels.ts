import type {
  MappingEvidence,
  SummaryLocationPrecision,
} from './mapResearchSummary'

/**
 * The one place evidence and precision states are turned into words. Badges,
 * the legend, hover previews and the copied research summary all read from
 * here, so a state can never be described two different ways in one view.
 */
const EVIDENCE_LABELS: Readonly<Record<MappingEvidence, string>> = {
  'verified-source': 'Verified-source mapping',
  curated: 'Curated mapping',
  mixed: 'Mixed mapping evidence',
  unmapped: 'No mapped findspot',
}

const EVIDENCE_SHORT_LABELS: Readonly<Record<MappingEvidence, string>> = {
  'verified-source': 'Verified source',
  curated: 'Curated',
  mixed: 'Mixed evidence',
  unmapped: 'Unmapped',
}

const PRECISION_LABELS: Readonly<Record<SummaryLocationPrecision, string>> = {
  'excavation-area': 'Excavation area',
  mixed: 'Mixed precision',
  unknown: 'Precision unknown',
}

export function mappingEvidenceLabel(evidence: MappingEvidence): string {
  return EVIDENCE_LABELS[evidence]
}

export function mappingEvidenceShortLabel(evidence: MappingEvidence): string {
  return EVIDENCE_SHORT_LABELS[evidence]
}

export function locationPrecisionLabel(
  precision: SummaryLocationPrecision,
): string {
  return PRECISION_LABELS[precision]
}

export const FRAGMENT_ACCESS_NOTE =
  'Fragment counts reflect records accessible to the current user.'

export const EXCAVATION_AREA_NOTE =
  'Excavation polygons represent mapped archaeological areas, not exact fragment coordinates.'

export const MAPPING_PROVENANCE_NOTE =
  'Detailed mapping provenance is not exposed by the current map-data response.'

export function linkedPolygonSentence(
  linkedPolygonCount: number,
  totalPolygonCount: number,
): string {
  return `${linkedPolygonCount} of ${totalPolygonCount}`
}

export const LINKED_POLYGON_LABEL = 'Excavation polygons linked'

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return count === 1 ? singular : plural
}

export function countLabel(
  count: number,
  singular: string,
  plural?: string,
): string {
  return `${count.toLocaleString('en')} ${pluralize(count, singular, plural)}`
}
