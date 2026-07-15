import {
  AnnotationSpans,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'

export const words = ['Word-1', 'Word-2', 'Word-3']

export const tag: ApiEntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1', 'Word-2'],
}

export const realia: ApiRealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1', 'Word-2'],
}

export function spans(
  namedEntities: readonly ApiEntityAnnotationSpan[] = [],
  realiaSpans: readonly ApiRealiaAnnotationSpan[] = [],
): AnnotationSpans {
  return { namedEntities, realia: realiaSpans }
}

export const tierOf = (
  annotations: readonly { id: string; tier: number }[],
  id: string,
): number => annotations.find((annotation) => annotation.id === id)?.tier ?? 0
