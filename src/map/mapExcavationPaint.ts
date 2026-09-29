import type { ExpressionSpecification } from 'maplibre-gl'
import {
  type ChoroplethScale,
  excavationFillColor,
  excavationFillOpacity,
  excavationOutlineColor,
  excavationOutlineDash,
  excavationOutlineOpacity,
  excavationOutlineWidth,
} from 'map/mapPaintExpressions'
import {
  evidenceFillColor,
  evidenceFillOpacity,
  evidenceOutlineColor,
  evidenceOutlineDash,
  evidenceOutlineOpacity,
  evidenceOutlineWidth,
} from 'map/mapEvidencePaint'
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
    outlineColor: excavationOutlineColor(scale),
    outlineWidth: excavationOutlineWidth(scale),
    outlineDash: excavationOutlineDash(scale),
    outlineOpacity: excavationOutlineOpacity(),
  }
}
