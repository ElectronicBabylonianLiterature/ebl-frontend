import { Fragment } from 'fragmentarium/domain/fragment'
import {
  NamedEntity,
  RealiaInfoEntry,
  RealiaNamedEntity,
} from 'fragmentarium/ui/text-annotation/EntityType'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { atfTokenKur } from 'test-support/test-tokens'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { Word } from 'transliteration/domain/token'

export const previewNamedEntities: readonly NamedEntity[] = [
  { id: 'Entity-1', type: 'PERSONAL_NAME' },
  { id: 'Entity-2', type: 'BUILDING_NAME' },
]

export const previewRealia: readonly RealiaNamedEntity[] = [
  { id: 'Realia-1', realiaId: 'realia_000846' },
]

export const previewRealiaInfo: readonly RealiaInfoEntry[] = [
  { realiaId: 'realia_000846', lemma: 'Apkallu', type: ['Divine names'] },
]

export function createAnnotatedWord(
  value: string,
  id: string | null,
  namedEntities: readonly string[] = [],
  realia: readonly string[] = [],
): Word {
  return {
    ...atfTokenKur,
    value,
    cleanValue: value,
    id,
    namedEntities,
    realia,
  }
}

export const annotatedWords: readonly Word[] = [
  createAnnotatedWord('kur', 'Word-1'),
  createAnnotatedWord('nu', 'Word-2', ['Entity-1', 'Entity-2']),
  createAnnotatedWord('bu', 'Word-3', ['Entity-2'], ['Realia-1']),
  createAnnotatedWord('ra', null, ['Entity-1']),
]

export function createAnnotatedText(words: readonly Word[]): Text {
  return new Text({
    lines: [
      new TextLine({
        type: 'TextLine',
        lineNumber: {
          type: 'LineNumber',
          number: 1,
          hasPrime: false,
          prefixModifier: null,
          suffixModifier: null,
        },
        prefix: '1.',
        content: words,
      }),
    ],
  })
}

export function createAnnotatedFragment(
  words: readonly Word[],
  namedEntities: readonly NamedEntity[],
  realia: readonly RealiaNamedEntity[],
  realiaInfo: readonly RealiaInfoEntry[] = [],
): Fragment {
  return fragmentFactory.build({
    number: 'Annotated.Fragment',
    text: createAnnotatedText(words),
    namedEntities,
    realia,
    realiaInfo,
  })
}

export const annotatedText = createAnnotatedText(annotatedWords)

export const annotatedFragment = createAnnotatedFragment(
  annotatedWords,
  previewNamedEntities,
  previewRealia,
  previewRealiaInfo,
)
