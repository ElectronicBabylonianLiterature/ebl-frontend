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

  get notes(): readonly NoteLine[] {
    return this.allLines.filter(isNoteLine)
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
