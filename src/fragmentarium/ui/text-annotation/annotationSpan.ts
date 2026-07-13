import {
  EntityType,
  EntityTypes,
} from 'fragmentarium/ui/text-annotation/EntityType'
import _ from 'lodash'

export interface ApiEntityAnnotationSpan {
  readonly id: string
  readonly type: EntityType
  readonly span: readonly string[]
}

export interface ApiRealiaAnnotationSpan {
  readonly id: string
  readonly realiaId: string
  readonly span: readonly string[]
}

export interface AnnotationSpans {
  readonly namedEntities: readonly ApiEntityAnnotationSpan[]
  readonly realia: readonly ApiRealiaAnnotationSpan[]
}

export const emptyAnnotationSpans: AnnotationSpans = {
  namedEntities: [],
  realia: [],
}

export const NAMED_ENTITY_LAYER = 'namedEntities'
export const REALIA_LAYER = 'realia'

export type AnnotationLayer = typeof NAMED_ENTITY_LAYER | typeof REALIA_LAYER

export type TaggedEntitySpan = ApiEntityAnnotationSpan & {
  readonly layer: typeof NAMED_ENTITY_LAYER
}
export type TaggedRealiaSpan = ApiRealiaAnnotationSpan & {
  readonly layer: typeof REALIA_LAYER
}
export type TaggedAnnotationSpan = TaggedEntitySpan | TaggedRealiaSpan

export interface DerivedSpanFields {
  readonly tier: number
  readonly name: string
}

export type EntityAnnotationSpan = TaggedEntitySpan & DerivedSpanFields
export type RealiaAnnotationSpan = TaggedRealiaSpan & DerivedSpanFields
export type AnnotationSpan = EntityAnnotationSpan | RealiaAnnotationSpan

export const ENTITY_ID_PREFIX = 'Entity'
export const REALIA_ID_PREFIX = 'Realia'

export const REALIA_INDICATOR_CLASS = 'named-entity__REALIA'

export function isRealiaAnnotationSpan<Span extends { layer: AnnotationLayer }>(
  span: Span,
): span is Extract<Span, { layer: typeof REALIA_LAYER }> {
  return span.layer === REALIA_LAYER
}

export function isEntityAnnotationSpan<Span extends { layer: AnnotationLayer }>(
  span: Span,
): span is Extract<Span, { layer: typeof NAMED_ENTITY_LAYER }> {
  return span.layer === NAMED_ENTITY_LAYER
}

export function tagEntitySpan(span: ApiEntityAnnotationSpan): TaggedEntitySpan {
  return { ...span, layer: NAMED_ENTITY_LAYER }
}

export function tagRealiaSpan(span: ApiRealiaAnnotationSpan): TaggedRealiaSpan {
  return { ...span, layer: REALIA_LAYER }
}

export function toTaggedSpans(
  spans: AnnotationSpans,
): readonly TaggedAnnotationSpan[] {
  return [
    ...spans.namedEntities.map(tagEntitySpan),
    ...spans.realia.map(tagRealiaSpan),
  ]
}

export function omitDerivedSpanFields(
  spans: readonly TaggedAnnotationSpan[],
): AnnotationSpans {
  return {
    namedEntities: spans
      .filter(isEntityAnnotationSpan)
      .map(({ id, type, span }) => ({ id, type, span })),
    realia: spans
      .filter(isRealiaAnnotationSpan)
      .map(({ id, realiaId, span }) => ({ id, realiaId, span })),
  }
}

export function annotationSpanName(span: TaggedAnnotationSpan): string {
  return isRealiaAnnotationSpan(span)
    ? span.realiaId
    : EntityTypes[span.type].name
}

export function spanRangeKey(span: readonly string[]): string {
  return [...span].sort().join(',')
}

export function isSameRange(
  first: readonly string[],
  second: readonly string[],
): boolean {
  return spanRangeKey(first) === spanRangeKey(second)
}

export function annotationSpanKey(span: TaggedAnnotationSpan): string {
  const value = isRealiaAnnotationSpan(span) ? span.realiaId : span.type
  return `${span.layer}:${value}|${spanRangeKey(span.span)}`
}

export function isDuplicateAnnotation(
  annotations: readonly TaggedAnnotationSpan[],
  candidate: TaggedAnnotationSpan,
): boolean {
  const candidateKey = annotationSpanKey(candidate)

  return annotations.some(
    (annotation) =>
      annotation.id !== candidate.id &&
      annotationSpanKey(annotation) === candidateKey,
  )
}

export function dedupeAnnotations(
  annotations: readonly TaggedAnnotationSpan[],
): readonly TaggedAnnotationSpan[] {
  return _.uniqBy(annotations, annotationSpanKey)
}

function onRange(
  annotations: readonly TaggedAnnotationSpan[],
  span: readonly string[],
  excludedId?: string,
): readonly TaggedAnnotationSpan[] {
  return annotations.filter(
    (annotation) =>
      annotation.id !== excludedId && isSameRange(annotation.span, span),
  )
}

export function getUsedEntityTypes(
  annotations: readonly TaggedAnnotationSpan[],
  span: readonly string[],
  excludedId?: string,
): readonly EntityType[] {
  return onRange(annotations, span, excludedId)
    .filter(isEntityAnnotationSpan)
    .map((annotation) => annotation.type)
}

export function getUsedRealiaIds(
  annotations: readonly TaggedAnnotationSpan[],
  span: readonly string[],
  excludedId?: string,
): readonly string[] {
  return onRange(annotations, span, excludedId)
    .filter(isRealiaAnnotationSpan)
    .map((annotation) => annotation.realiaId)
}

export function createAnnotationSpanId(
  spans: readonly { id: string }[],
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
