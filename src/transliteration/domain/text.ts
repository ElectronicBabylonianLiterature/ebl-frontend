import produce, { immerable, Draft, castDraft } from 'immer'
import _ from 'lodash'
import DictionaryWord from 'dictionary/domain/Word'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Line, NoteLine, TextLine } from 'transliteration/domain/line'
import { Word as TransliterationWord } from 'transliteration/domain/token'
import {
  isTextLine,
  isWord,
  isObjectAtLine,
  isSurfaceAtLine,
  isColumnAtLine,
} from 'transliteration/domain/type-guards'
import Lemma from './Lemma'
import { isNoteLine } from './type-guards'
import { LineNumber, LineNumberRange } from './line-number'
import { ObjectLabel, SurfaceLabel, ColumnLabel } from './labels'

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
  readonly label: Label
  readonly value: string
  readonly word: TransliterationWord
  readonly uniqueLemma: string
  readonly dictionaryWord?: DictionaryWord
}

export class Label {
  readonly [immerable] = true
  readonly object: ObjectLabel | null = null
  readonly surface: SurfaceLabel | null = null
  readonly column: ColumnLabel | null = null
  readonly line: LineNumber | LineNumberRange | null = null

  constructor(
    object: ObjectLabel | null = null,
    surface: SurfaceLabel | null = null,
    column: ColumnLabel | null = null,
    line: LineNumber | LineNumberRange | null = null
  ) {
    this.object = object
    this.surface = surface
    this.column = column
    this.line = line
  }

  setObject(object: ObjectLabel): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.object = castDraft(object)
    })
  }

  setSurface(surface: SurfaceLabel): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.surface = castDraft(surface)
    })
  }

  setColumn(column: ColumnLabel): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.column = castDraft(column)
    })
  }

  setLineNumber(line: LineNumber | LineNumberRange): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.line = castDraft(line)
    })
  }
}

type LabeledLine = readonly [Label, TextLine]

export class Text {
  readonly allLines: readonly Line[]

  constructor({ lines }: { lines: readonly Line[] }) {
    this.allLines = lines
  }

  get numberOfColumns(): number {
    return (
      _(this.allLines)
        .map((line) => (isTextLine(line) ? line.numberOfColumns : 1))
        .max() ?? 1
    )
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
    const [, labeledLines] = _.reduce(
      this.lines,
      (
        [current, lines]: [Label, LabeledLine[]],
        line: Line
      ): [Label, LabeledLine[]] => {
        if (isTextLine(line)) {
          return [
            current,
            [...lines, [current.setLineNumber(line.lineNumber), line]],
          ]
        } else if (isObjectAtLine(line)) {
          return [current.setObject(line.label), lines]
        } else if (isSurfaceAtLine(line)) {
          return [current.setSurface(line.surface_label), lines]
        } else if (isColumnAtLine(line)) {
          return [current.setColumn(line.column_label), lines]
        } else {
          return [current, lines]
        }
      },
      [new Label(), []]
    )

    return _(labeledLines)
      .flatMap(([label, line]) =>
        line.content
          .filter(isWord)
          .filter((token: TransliterationWord) => token.lemmatizable)
          .flatMap(
            (token): GlossaryToken[] =>
              token.uniqueLemma?.map((lemma) => ({
                label: label,
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
