import { castDraft, Draft, produce } from 'immer'
import { Fragment } from 'fragmentarium/domain/fragment'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { Text } from 'transliteration/domain/text'
import { isIdToken } from 'transliteration/domain/type-guards'

type IdsByWord = ReadonlyMap<string, readonly string[]>

function collectIdsByWord(
  spans: readonly { id: string; span: readonly string[] }[],
): IdsByWord {
  const idsByWord = new Map<string, readonly string[]>()
  spans.forEach(({ id, span }) =>
    span.forEach((wordId) =>
      idsByWord.set(wordId, [...(idsByWord.get(wordId) ?? []), id]),
    ),
  )
  return idsByWord
}

function annotateLine(
  line: AbstractLine,
  namedEntities: IdsByWord,
  realia: IdsByWord,
): AbstractLine {
  return produce(line, (draft: Draft<AbstractLine>) => {
    draft.content = castDraft(
      line.content.map((token) =>
        isIdToken(token) && token.id
          ? {
              ...token,
              namedEntities: namedEntities.get(token.id) ?? [],
              realia: realia.get(token.id) ?? [],
            }
          : token,
      ),
    )
  })
}

function annotateText(
  text: Text,
  namedEntities: IdsByWord,
  realia: IdsByWord,
): Text {
  return produce(text, (draft: Draft<Text>) => {
    draft.allLines = castDraft(
      draft.allLines.map((line) => annotateLine(line, namedEntities, realia)),
    )
  })
}

export function withAnnotationSpans(
  fragment: Fragment,
  spans: AnnotationSpans,
): Fragment {
  const namedEntities = collectIdsByWord(spans.namedEntities)
  const realia = collectIdsByWord(spans.realia)

  return produce(fragment, (draft: Draft<Fragment>) => {
    draft.namedEntities = spans.namedEntities.map(({ id, type }) => ({
      id,
      type,
    }))
    draft.realia = spans.realia.map(({ id, realiaId }) => ({ id, realiaId }))
    draft.text = castDraft(annotateText(fragment.text, namedEntities, realia))
  })
}
