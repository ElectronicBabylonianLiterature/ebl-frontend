import { immerable } from 'immer'
import _ from 'lodash'
import DictionaryWord from 'dictionary/domain/Word'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Line, NoteLine, TextLine } from 'transliteration/domain/line'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { Word as TransliterationWord } from 'transliteration/domain/token'
import { isTextLine, isWord } from 'transliteration/domain/type-guards'
import Lemma from './Lemma'
import { isNoteLine } from './type-guards'

export type Notes = ReadonlyMap<number, readonly NoteLine[]>

export function noteNumber(
  notes: Notes,
  lineIndex: number,
  noteIndex: number
): number {
  const numberOfNotesOnPreviousLines = _.sum(
    _.range(0, lineIndex).map((index) => notes.get(index)?.length ?? 0)
  )
  return 1 + noteIndex + numberOfNotesOnPreviousLines
}

export interface GlossaryToken {
  readonly number: string
  readonly value: string
  readonly word: TransliterationWord
  readonly uniqueLemma: string
  readonly dictionaryWord?: DictionaryWord
}

export class Text {
  readonly allLines: readonly Line[]

  constructor({ lines }: { lines: readonly Line[] }) {
    this.allLines = lines
  }

  get lines(): readonly Line[] {
    return this.allLines.filter((line) => !isNoteLine(line))
  }

  get notes(): Notes {
    const notes: Map<number, NoteLine[]> = new Map([[0, []]])
    let lineNumber = 0
    for (const line of this.allLines) {
      if (isNoteLine(line)) {
        notes.get(lineNumber)?.push(line)
      } else {
        lineNumber++
        notes.set(lineNumber, [])
      }
    }
    return notes
  }

  get glossary(): [string, readonly GlossaryToken[]][] {
    return _(this.lines)
      .filter(isTextLine)
      .flatMap((line: TextLine) =>
        line.content
          .filter(isWord)
          .filter((token: TransliterationWord) => token.lemmatizable)
          .flatMap(
            (token): GlossaryToken[] =>
              token.uniqueLemma?.map((lemma) => ({
                number: lineNumberToString(line.lineNumber),
                value: token.value,
                word: token,
                uniqueLemma: lemma,
              })) ?? []
          )
      )
      .groupBy((token) => token.uniqueLemma)
      .toPairs()
      .sortBy(([lemma, tokensByLemma]) => lemma)
      .value()
  }

  createLemmatization(
    lemmas: { [key: string]: Lemma },
    suggestions: { [key: string]: readonly UniqueLemma[] }
  ): Lemmatization {
    return new Lemmatization(
      this.allLines.map((line) => line.prefix),
      this.allLines
        .map((line) => line.content)
        .map((tokens) =>
          tokens.map((token) =>
            token.lemmatizable
              ? new LemmatizationToken(
                  token.value,
                  true,
                  (token.uniqueLemma || []).map((id) => lemmas[id]),
                  suggestions[token.cleanValue]
                )
              : new LemmatizationToken(token.value, false)
          )
        )
    )
  }
}
Text[immerable] = true
