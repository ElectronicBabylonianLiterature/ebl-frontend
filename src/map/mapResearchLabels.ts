import type {
  MappingEvidence,
  SummaryLocationPrecision,
} from 'map/mapResearchSummary'
const EVIDENCE_LABELS: Readonly<Record<MappingEvidence, string>> = {
  'verified-source': 'Verified-source mapping',
  curated: 'Curated mapping',
  mixed: 'Mixed mapping evidence',
  unmapped: 'No mapped findspot',
}

const PRECISION_LABELS: Readonly<Record<SummaryLocationPrecision, string>> = {
  'excavation-area': 'Excavation area',
  mixed: 'Mixed precision',
  unknown: 'Precision unknown',
}

export function mappingEvidenceLabel(evidence: MappingEvidence): string {
  return EVIDENCE_LABELS[evidence]
}

export function locationPrecisionLabel(
  precision: SummaryLocationPrecision,
): string {
  return PRECISION_LABELS[precision]
}

export const FRAGMENT_ACCESS_NOTE =
  'Tablet counts reflect records accessible to the current user.'

export const EXCAVATION_AREA_NOTE =
  'Excavation polygons represent mapped archaeological areas, not exact tablet coordinates.'

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
