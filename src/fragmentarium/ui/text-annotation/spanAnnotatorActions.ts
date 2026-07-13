import {
  AnnotationSpan,
  ApiAnnotationSpan,
  createAnnotationSpanId,
  ENTITY_ID_PREFIX,
  isEntityAnnotationSpan,
  REALIA_ID_PREFIX,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { EntityType } from 'fragmentarium/ui/text-annotation/EntityType'
import { getEntryEntityType } from 'fragmentarium/ui/text-annotation/realiaTypeMapping'
import { RealiaOption } from 'fragmentarium/ui/text-annotation/RealiaSelect'
import _ from 'lodash'

export function hasTagForSpan(
  annotations: readonly AnnotationSpan[],
  span: readonly string[],
): boolean {
  return annotations
    .filter(isEntityAnnotationSpan)
    .some((annotation) => _.isEqual(annotation.span, span))
}

function createTagAnnotation(
  annotations: readonly AnnotationSpan[],
  span: readonly string[],
  type: EntityType,
): ApiAnnotationSpan {
  return {
    id: createAnnotationSpanId(annotations, ENTITY_ID_PREFIX),
    type,
    span,
  }
}

export function buildTagAnnotations(
  annotations: readonly AnnotationSpan[],
  span: readonly string[],
  option: { value: EntityType } | null,
): readonly ApiAnnotationSpan[] {
  return option ? [createTagAnnotation(annotations, span, option.value)] : []
}

export function buildRealiaAnnotations(
  annotations: readonly AnnotationSpan[],
  span: readonly string[],
  option: RealiaOption | null,
): readonly ApiAnnotationSpan[] {
  if (!option) {
    return []
  }

  const realiaAnnotation: ApiAnnotationSpan = {
    id: createAnnotationSpanId(annotations, REALIA_ID_PREFIX),
    realiaId: option.value,
    span,
  }
  const mappedType = option.entry ? getEntryEntityType(option.entry) : null
  const shouldAddTag = !!mappedType && !hasTagForSpan(annotations, span)

  return shouldAddTag
    ? [realiaAnnotation, createTagAnnotation(annotations, span, mappedType)]
    : [realiaAnnotation]
}
