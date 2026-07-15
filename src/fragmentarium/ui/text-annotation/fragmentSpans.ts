import { Fragment } from 'fragmentarium/domain/fragment'
import {
  AnnotationSpans,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  NamedEntity,
  RealiaNamedEntity,
} from 'fragmentarium/ui/text-annotation/EntityType'
import { Text } from 'transliteration/domain/text'
import { AnyWord } from 'transliteration/domain/token'
import { isIdToken, isTextLine } from 'transliteration/domain/type-guards'

function getWords(text: Text): readonly AnyWord[] {
  return text.lines
    .filter(isTextLine)
    .flatMap((line) => line.content.filter(isIdToken))
}

export function getWordIds(text: Text): readonly string[] {
  return getWords(text).map((word) => word.id || '')
}

function collectSpans(
  words: readonly AnyWord[],
  getAnnotationIds: (word: AnyWord) => readonly string[],
): ReadonlyMap<string, readonly string[]> {
  const spans = new Map<string, readonly string[]>()

  words.forEach((word) => {
    const wordId = word.id
    if (!wordId) {
      return
    }
    getAnnotationIds(word).forEach((annotationId) => {
      spans.set(annotationId, [...(spans.get(annotationId) || []), wordId])
    })
  })

  return spans
}

function toSpans<Annotation extends { id: string }, Span>(
  annotations: readonly Annotation[],
  spans: ReadonlyMap<string, readonly string[]>,
  createSpan: (annotation: Annotation, span: readonly string[]) => Span,
): readonly Span[] {
  return annotations
    .filter((annotation) => (spans.get(annotation.id) || []).length > 0)
    .map((annotation) =>
      createSpan(annotation, spans.get(annotation.id) as readonly string[]),
    )
}

function createEntitySpans(
  words: readonly AnyWord[],
  namedEntities: readonly NamedEntity[],
): readonly ApiEntityAnnotationSpan[] {
  const spans = collectSpans(words, (word) => word.namedEntities || [])

  return toSpans(namedEntities, spans, ({ id, type }, span) => ({
    id,
    type,
    span,
  }))
}

function createRealiaSpans(
  words: readonly AnyWord[],
  realia: readonly RealiaNamedEntity[],
): readonly ApiRealiaAnnotationSpan[] {
  const spans = collectSpans(words, (word) => word.realia || [])

  return toSpans(realia, spans, ({ id, realiaId }, span) => ({
    id,
    realiaId,
    span,
  }))
}

export function createFragmentAnnotationSpans(
  fragment: Fragment,
): AnnotationSpans {
  const words = getWords(fragment.text)

  return {
    namedEntities: createEntitySpans(words, fragment.namedEntities || []),
    realia: createRealiaSpans(words, fragment.realia || []),
  }
}
