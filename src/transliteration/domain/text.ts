import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Line, NoteLine } from 'transliteration/domain/line'
import Lemma from './Lemma'
import { isNoteLine } from './type-guards'

export class Text {
  private readonly allLines: readonly Line[]

  constructor({ lines }: { lines: readonly Line[] }) {
    this.allLines = lines
  }

  get lines(): readonly Line[] {
    return this.allLines.filter((line) => !isNoteLine(line))
  }

  get notes(): ReadonlyMap<number, readonly NoteLine[]> {
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
                  suggestions[token.cleanValue]
                )
              : new LemmatizationToken(token.value, false)
          )
        )
    )
  }
}
Text[immerable] = true
