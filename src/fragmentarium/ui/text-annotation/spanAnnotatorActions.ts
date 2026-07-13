import {
  createAnnotationSpanId,
  ENTITY_ID_PREFIX,
  getUsedEntityTypes,
  REALIA_ID_PREFIX,
  TaggedAnnotationSpan,
  TaggedEntitySpan,
  TaggedRealiaSpan,
  tagEntitySpan,
  tagRealiaSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { EntityType } from 'fragmentarium/ui/text-annotation/EntityType'
import { getEntryEntityType } from 'fragmentarium/ui/text-annotation/realiaTypeMapping'
import { RealiaOption } from 'fragmentarium/ui/text-annotation/RealiaSelect'

export function hasTagForSpan(
  annotations: readonly TaggedAnnotationSpan[],
  span: readonly string[],
): boolean {
  return getUsedEntityTypes(annotations, span).length > 0
}

function createTagAnnotation(
  annotations: readonly TaggedAnnotationSpan[],
  span: readonly string[],
  type: EntityType,
): TaggedEntitySpan {
  return tagEntitySpan({
    id: createAnnotationSpanId(annotations, ENTITY_ID_PREFIX),
    type,
    span,
  })
}

export function buildTagAnnotations(
  annotations: readonly TaggedAnnotationSpan[],
  span: readonly string[],
  option: { value: EntityType } | null,
): readonly TaggedAnnotationSpan[] {
  return option ? [createTagAnnotation(annotations, span, option.value)] : []
}

export function buildRealiaAnnotations(
  annotations: readonly TaggedAnnotationSpan[],
  span: readonly string[],
  option: RealiaOption | null,
): readonly TaggedAnnotationSpan[] {
  if (!option) {
    return []
  }

  const realiaAnnotation: TaggedRealiaSpan = tagRealiaSpan({
    id: createAnnotationSpanId(annotations, REALIA_ID_PREFIX),
    realiaId: option.value,
    span,
  })
  const mappedType = option.entry ? getEntryEntityType(option.entry) : null
  const shouldAddTag = !!mappedType && !hasTagForSpan(annotations, span)

  return shouldAddTag
    ? [realiaAnnotation, createTagAnnotation(annotations, span, mappedType)]
    : [realiaAnnotation]
}
