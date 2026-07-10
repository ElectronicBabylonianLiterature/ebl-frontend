import {
  EntityType,
  EntityTypes,
} from 'fragmentarium/ui/text-annotation/EntityType'
import _ from 'lodash'

export interface ApiAnnotationSpanBase {
  readonly id: string
  readonly span: readonly string[]
}

export interface ApiEntityAnnotationSpan extends ApiAnnotationSpanBase {
  readonly type: EntityType
}

export interface ApiRealiaAnnotationSpan extends ApiAnnotationSpanBase {
  readonly realiaId: string
}

export type ApiAnnotationSpan =
  | ApiEntityAnnotationSpan
  | ApiRealiaAnnotationSpan

export interface DerivedSpanFields {
  readonly tier: number
  readonly name: string
}

export type EntityAnnotationSpan = ApiEntityAnnotationSpan & DerivedSpanFields
export type RealiaAnnotationSpan = ApiRealiaAnnotationSpan & DerivedSpanFields
export type AnnotationSpan = EntityAnnotationSpan | RealiaAnnotationSpan

export const ENTITY_ID_PREFIX = 'Entity'
export const REALIA_ID_PREFIX = 'Realia'

export const REALIA_INDICATOR_CLASS = 'named-entity__REALIA'

export function hasRealiaId<Value extends object>(
  value: Value,
): value is Value & { realiaId: string } {
  return 'realiaId' in value
}

export function isRealiaAnnotationSpan<Span extends ApiAnnotationSpanBase>(
  span: Span,
): span is Span & ApiRealiaAnnotationSpan {
  return hasRealiaId(span)
}

export function isEntityAnnotationSpan<Span extends ApiAnnotationSpanBase>(
  span: Span,
): span is Span & ApiEntityAnnotationSpan {
  return 'type' in span
}

export function annotationSpanName(span: ApiAnnotationSpan): string {
  return isRealiaAnnotationSpan(span)
    ? span.realiaId
    : EntityTypes[span.type].name
}

export function annotationSpanClassName(span: ApiAnnotationSpan): string {
  return isRealiaAnnotationSpan(span)
    ? REALIA_INDICATOR_CLASS
    : `named-entity__${span.type}`
}

export function omitDerivedSpanFields(
  spans: readonly AnnotationSpan[],
): readonly ApiAnnotationSpan[] {
  return spans.map((span) => _.omit(span, 'tier', 'name') as ApiAnnotationSpan)
}

export function createAnnotationSpanId(
  spans: readonly ApiAnnotationSpanBase[],
  prefix: string,
): string {
  const currentMaxId =
    _.max(
      spans
        .filter(({ id }) => id.startsWith(`${prefix}-`))
        .map(({ id }) => parseInt(id.slice(prefix.length + 1))),
    ) || 0

  return `${prefix}-${currentMaxId + 1}`
}
