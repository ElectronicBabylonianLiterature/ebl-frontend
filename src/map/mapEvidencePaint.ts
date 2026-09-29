import type { ExpressionSpecification } from 'maplibre-gl'
import {
  COLOR_SELECTED,
  COLOR_UNAVAILABLE,
  COLOR_UNMAPPED,
  DASH_MAPPED,
  DASH_UNAVAILABLE,
  DASH_UNMAPPED,
  OUTLINE_SELECTED,
  OUTLINE_UNAVAILABLE,
  OUTLINE_UNMAPPED,
} from 'map/mapPaintColors'
import type { MappingEvidence } from 'map/mapResearchSummary'
import {
  HOVERED,
  SELECTED,
  stateBoolean,
  stateNumber,
} from 'map/mapStateExpressions'

export const EVIDENCE_CODES: Readonly<Record<MappingEvidence, number>> = {
  unmapped: 0,
  'verified-source': 1,
  curated: 2,
  mixed: 3,
}

export const COLOR_EVIDENCE_VERIFIED = '#b3702a'
export const COLOR_EVIDENCE_CURATED = '#3f6f8f'
export const COLOR_EVIDENCE_MIXED = '#6f5f9c'
export const OUTLINE_EVIDENCE_VERIFIED = '#7f4f20'
export const OUTLINE_EVIDENCE_CURATED = '#2c516b'
export const OUTLINE_EVIDENCE_MIXED = '#4b3f74'
export const DASH_CURATED: readonly number[] = [5, 2]
export const DASH_MIXED: readonly number[] = [3, 1.2, 1, 1.2]

const EVIDENCE_CODE = stateNumber('evidenceCode')
const IS_UNAVAILABLE: ExpressionSpecification = [
  '!',
  stateBoolean('dataAvailable'),
]
const HAS_NO_FRAGMENTS: ExpressionSpecification = [
  '==',
  stateNumber('accessibleFragmentCount'),
  0,
]
const IS_UNMAPPED: ExpressionSpecification = ['==', EVIDENCE_CODE, 0]

function byEvidence<T>(
  unmapped: T,
  verified: T,
  curated: T,
  mixed: T,
): ExpressionSpecification {
  return [
    'step',
    EVIDENCE_CODE,
    unmapped,
    EVIDENCE_CODES['verified-source'],
    verified,
    EVIDENCE_CODES.curated,
    curated,
    EVIDENCE_CODES.mixed,
    mixed,
  ] as unknown as ExpressionSpecification
}

export function evidenceFillColor(): ExpressionSpecification {
  return [
    'case',
    SELECTED,
    COLOR_SELECTED,
    IS_UNAVAILABLE,
    COLOR_UNAVAILABLE,
    byEvidence(
      COLOR_UNMAPPED,
      COLOR_EVIDENCE_VERIFIED,
      COLOR_EVIDENCE_CURATED,
      COLOR_EVIDENCE_MIXED,
    ),
  ] as unknown as ExpressionSpecification
}

export function evidenceFillOpacity(): ExpressionSpecification {
  return [
    'case',
    SELECTED,
    0.4,
    HOVERED,
    0.34,
    IS_UNAVAILABLE,
    0.12,
    IS_UNMAPPED,
    0.07,
    HAS_NO_FRAGMENTS,
    0.16,
    0.3,
  ]
}

export function evidenceOutlineColor(): ExpressionSpecification {
  return [
    'case',
    SELECTED,
    OUTLINE_SELECTED,
    IS_UNAVAILABLE,
    OUTLINE_UNAVAILABLE,
    byEvidence(
      OUTLINE_UNMAPPED,
      OUTLINE_EVIDENCE_VERIFIED,
      OUTLINE_EVIDENCE_CURATED,
      OUTLINE_EVIDENCE_MIXED,
    ),
  ] as unknown as ExpressionSpecification
}

export function evidenceOutlineWidth(): ExpressionSpecification {
  return [
    'case',
    SELECTED,
    3.5,
    HOVERED,
    2.4,
    IS_UNAVAILABLE,
    1,
    byEvidence(1, 1.7, 1.7, 2.2),
  ] as unknown as ExpressionSpecification
}

export function evidenceOutlineDash(): ExpressionSpecification {
  return [
    'case',
    IS_UNAVAILABLE,
    ['literal', [...DASH_UNAVAILABLE]],
    byEvidence(
      ['literal', [...DASH_UNMAPPED]],
      ['literal', [...DASH_MAPPED]],
      ['literal', [...DASH_CURATED]],
      ['literal', [...DASH_MIXED]],
    ),
  ] as unknown as ExpressionSpecification
}

export function evidenceOutlineOpacity(): ExpressionSpecification {
  return ['case', SELECTED, 0.95, IS_UNAVAILABLE, 0.55, IS_UNMAPPED, 0.45, 0.85]
}
