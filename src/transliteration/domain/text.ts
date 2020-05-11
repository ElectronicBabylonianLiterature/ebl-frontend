import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { Line, NoteLine } from 'transliteration/domain/line'
import Lemma from './Lemma'
import { isNoteLine } from './type-guards'

export class Text {
  readonly lines: readonly Line[]

  constructor({ lines }: { lines: readonly Line[] }) {
    this.lines = lines
  }

  get notes(): readonly NoteLine[] {
    return this.lines.filter(isNoteLine)
  }

  createLemmatization(
    lemmas: { [key: string]: Lemma },
    suggestions: { [key: string]: readonly UniqueLemma[] }
  ): Lemmatization {
    return new Lemmatization(
      this.lines.map((line) => line.prefix),
      this.lines
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
