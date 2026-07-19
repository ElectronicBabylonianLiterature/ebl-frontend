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

export interface DerivedSpanFields {
  readonly tier: number
  readonly name: string
}

export type EntityAnnotationSpan = ApiEntityAnnotationSpan &
  DerivedSpanFields & { readonly layer: typeof NAMED_ENTITY_LAYER }
export type RealiaAnnotationSpan = ApiRealiaAnnotationSpan &
  DerivedSpanFields & { readonly layer: typeof REALIA_LAYER }

export type AnnotationSpan = EntityAnnotationSpan | RealiaAnnotationSpan

export interface DerivedAnnotationSpans {
  readonly namedEntities: readonly EntityAnnotationSpan[]
  readonly realia: readonly RealiaAnnotationSpan[]
}

export const ENTITY_ID_PREFIX = 'Entity'
export const REALIA_ID_PREFIX = 'Realia'

export const REALIA_INDICATOR_CLASS = 'named-entity__REALIA'

export function isRealiaAnnotationSpan(
  span: AnnotationSpan,
): span is RealiaAnnotationSpan {
  return span.layer === REALIA_LAYER
}

export function entitySpanName(span: ApiEntityAnnotationSpan): string {
  return EntityTypes[span.type].name
}

export function annotationSpanName(span: AnnotationSpan): string {
  return isRealiaAnnotationSpan(span) ? span.realiaId : entitySpanName(span)
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

export function entitySpanKey(span: ApiEntityAnnotationSpan): string {
  return `${span.type}|${spanRangeKey(span.span)}`
}

export function realiaSpanKey(span: ApiRealiaAnnotationSpan): string {
  return `${span.realiaId}|${spanRangeKey(span.span)}`
}

function isDuplicate<Span extends { id: string }>(
  spans: readonly Span[],
  candidate: Span,
  key: (span: Span) => string,
): boolean {
  const candidateKey = key(candidate)
  return spans.some(
    (span) => span.id !== candidate.id && key(span) === candidateKey,
  )
}

export function isDuplicateEntitySpan(
  spans: readonly ApiEntityAnnotationSpan[],
  candidate: ApiEntityAnnotationSpan,
): boolean {
  return isDuplicate(spans, candidate, entitySpanKey)
}

export function isDuplicateRealiaSpan(
  spans: readonly ApiRealiaAnnotationSpan[],
  candidate: ApiRealiaAnnotationSpan,
): boolean {
  return isDuplicate(spans, candidate, realiaSpanKey)
}

export function dedupeEntitySpans(
  spans: readonly ApiEntityAnnotationSpan[],
): readonly ApiEntityAnnotationSpan[] {
  return _.uniqBy(spans, entitySpanKey)
}

export function dedupeRealiaSpans(
  spans: readonly ApiRealiaAnnotationSpan[],
): readonly ApiRealiaAnnotationSpan[] {
  return _.uniqBy(spans, realiaSpanKey)
}

function onRange<Span extends { id: string; span: readonly string[] }>(
  spans: readonly Span[],
  span: readonly string[],
  excludedId?: string,
): readonly Span[] {
  return spans.filter(
    (candidate) =>
      candidate.id !== excludedId && isSameRange(candidate.span, span),
  )
}

export function getUsedEntityTypes(
  spans: readonly ApiEntityAnnotationSpan[],
  span: readonly string[],
  excludedId?: string,
): readonly EntityType[] {
  return onRange(spans, span, excludedId).map((candidate) => candidate.type)
}

export function getUsedRealiaIds(
  spans: readonly ApiRealiaAnnotationSpan[],
  span: readonly string[],
  excludedId?: string,
): readonly string[] {
  return onRange(spans, span, excludedId).map((candidate) => candidate.realiaId)
}

export function toEntitySpans(
  spans: readonly EntityAnnotationSpan[],
): readonly ApiEntityAnnotationSpan[] {
  return spans.map(({ id, type, span }) => ({ id, type, span }))
}

export function toRealiaSpans(
  spans: readonly RealiaAnnotationSpan[],
): readonly ApiRealiaAnnotationSpan[] {
  return spans.map(({ id, realiaId, span }) => ({ id, realiaId, span }))
}

export function omitDerivedSpanFields(
  spans: DerivedAnnotationSpans,
): AnnotationSpans {
  return {
    namedEntities: toEntitySpans(spans.namedEntities),
    realia: toRealiaSpans(spans.realia),
  }
}

export function createAnnotationSpanId(
  existingIds: readonly string[],
  prefix: string,
): string {
  const currentMaxId =
    _.max(
      existingIds
        .filter((id) => id.startsWith(`${prefix}-`))
        .map((id) => parseInt(id.slice(prefix.length + 1))),
    ) || 0

  return `${prefix}-${currentMaxId + 1}`
}
