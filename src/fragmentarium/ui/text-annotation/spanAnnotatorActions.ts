import {
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  createAnnotationSpanId,
  DerivedAnnotationSpans,
  ENTITY_ID_PREFIX,
  getUsedEntityTypes,
  REALIA_ID_PREFIX,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { EntityType } from 'fragmentarium/ui/text-annotation/EntityType'
import { getEntryEntityType } from 'fragmentarium/ui/text-annotation/realiaTypeMapping'
import { RealiaOption } from 'fragmentarium/ui/text-annotation/RealiaSelect'

export interface NewAnnotations {
  readonly tag: ApiEntityAnnotationSpan | null
  readonly realia: ApiRealiaAnnotationSpan | null
}

export const noNewAnnotations: NewAnnotations = { tag: null, realia: null }

export function isEmpty(annotations: NewAnnotations): boolean {
  return !annotations.tag && !annotations.realia
}

export function getExistingIds(
  spans: DerivedAnnotationSpans,
): readonly string[] {
  return [
    ...spans.namedEntities.map(({ id }) => id),
    ...spans.realia.map(({ id }) => id),
  ]
}

export function hasTagForSpan(
  spans: DerivedAnnotationSpans,
  span: readonly string[],
): boolean {
  return getUsedEntityTypes(spans.namedEntities, span).length > 0
}

function createTagAnnotation(
  spans: DerivedAnnotationSpans,
  span: readonly string[],
  type: EntityType,
): ApiEntityAnnotationSpan {
  return {
    id: createAnnotationSpanId(getExistingIds(spans), ENTITY_ID_PREFIX),
    type,
    span,
  }
}

export function buildTagAnnotations(
  spans: DerivedAnnotationSpans,
  span: readonly string[],
  option: { value: EntityType } | null,
): NewAnnotations {
  return option
    ? { tag: createTagAnnotation(spans, span, option.value), realia: null }
    : noNewAnnotations
}

export function buildRealiaAnnotations(
  spans: DerivedAnnotationSpans,
  span: readonly string[],
  option: RealiaOption | null,
): NewAnnotations {
  if (!option) {
    return noNewAnnotations
  }

  const realia: ApiRealiaAnnotationSpan = {
    id: createAnnotationSpanId(getExistingIds(spans), REALIA_ID_PREFIX),
    realiaId: option.value,
    span,
  }
  const mappedType = option.entry ? getEntryEntityType(option.entry) : null
  const shouldAddTag = !!mappedType && !hasTagForSpan(spans, span)

  return {
    tag: shouldAddTag ? createTagAnnotation(spans, span, mappedType) : null,
    realia,
  }
}
