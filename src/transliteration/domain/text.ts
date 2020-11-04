import { immerable } from 'immer'
import _ from 'lodash'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { TextLine } from 'transliteration/domain/text-line'
import { NoteLine } from 'transliteration/domain/note-line'
import { isTextLine } from 'transliteration/domain/type-guards'
import Lemma from './Lemma'
import { isNoteLine } from './type-guards'
import { AbstractLine } from './abstract-line'
import Label from './Label'

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

type LabeledLine = readonly [Label, TextLine]

export class Text {
  readonly allLines: readonly AbstractLine[]

  constructor({ lines }: { lines: readonly AbstractLine[] }) {
    this.allLines = lines
  }

  get numberOfColumns(): number {
    return (
      _(this.allLines)
        .map((line) => (isTextLine(line) ? line.numberOfColumns : 1))
        .max() ?? 1
    )
  }

  get lines(): readonly AbstractLine[] {
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
                  suggestions[token.cleanValue] ?? []
                )
              : new LemmatizationToken(token.value, false)
          )
        )
    )
  }
}
Text[immerable] = true
