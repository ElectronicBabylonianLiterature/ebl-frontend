import type { ExpressionSpecification } from 'maplibre-gl'
import {
  type ChoroplethScale,
  excavationFillColor,
  excavationFillOpacity,
  excavationOutlineColor,
  excavationOutlineDash,
  excavationOutlineOpacity,
  excavationOutlineWidth,
} from './mapPaintExpressions'
import {
  evidenceFillColor,
  evidenceFillOpacity,
  evidenceOutlineColor,
  evidenceOutlineDash,
  evidenceOutlineOpacity,
  evidenceOutlineWidth,
} from './mapEvidencePaint'

/**
 * Which visual system the excavation polygons are painted with. Keeping the
 * three modes in one discriminated union means every consumer — the initial
 * layer definition, the in-place repaint and the legend — reads the same
 * value, and adding a mode cannot leave one of them behind.
 */
export type ExcavationPaint =
  | { readonly kind: 'categorical' }
  | { readonly kind: 'evidence' }
  | { readonly kind: 'choropleth'; readonly scale: ChoroplethScale }

export const CATEGORICAL_PAINT: ExcavationPaint = { kind: 'categorical' }
export const EVIDENCE_PAINT: ExcavationPaint = { kind: 'evidence' }

export interface ExcavationPaintProperties {
  readonly fillColor: ExpressionSpecification
  readonly fillOpacity: ExpressionSpecification
  readonly outlineColor: ExpressionSpecification
  readonly outlineWidth: ExpressionSpecification
  readonly outlineDash: ExpressionSpecification
  readonly outlineOpacity: ExpressionSpecification
}

export function excavationPaintProperties(
  paint: ExcavationPaint,
): ExcavationPaintProperties {
  if (paint.kind === 'evidence') {
    return {
      fillColor: evidenceFillColor(),
      fillOpacity: evidenceFillOpacity(),
      outlineColor: evidenceOutlineColor(),
      outlineWidth: evidenceOutlineWidth(),
      outlineDash: evidenceOutlineDash(),
      outlineOpacity: evidenceOutlineOpacity(),
    }
  }

  const scale = paint.kind === 'choropleth' ? paint.scale : null

  return {
    fillColor: excavationFillColor(scale),
    fillOpacity: excavationFillOpacity(scale),
    outlineColor: excavationOutlineColor(),
    outlineWidth: excavationOutlineWidth(scale),
    outlineDash: excavationOutlineDash(),
    outlineOpacity: excavationOutlineOpacity(),
  }
}
