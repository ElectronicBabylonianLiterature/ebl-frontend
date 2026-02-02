import _ from 'lodash'
import { produce, castDraft, Draft, immerable } from 'immer'

import Lemma from './Lemma'

export type UniqueLemma = ReadonlyArray<Lemma>

export interface LemmatizationTokenDto {
  value: string
  uniqueLemma?: string[]
}

export type LemmatizationDto = ReadonlyArray<
  ReadonlyArray<LemmatizationTokenDto>
>

export class LemmatizationToken {
  [immerable] = true
  readonly value: string
  readonly uniqueLemma: UniqueLemma | null
  readonly suggestions: ReadonlyArray<UniqueLemma> | null
  readonly lemmatizable: boolean
  readonly suggested: boolean

  constructor(
    value: string,
    lemmatizable: boolean,
    uniqueLemma: UniqueLemma | null = null,
    suggestions: ReadonlyArray<UniqueLemma> | null = null,
    suggested = false,
  ) {
    this.value = value
    this.uniqueLemma = uniqueLemma
    this.suggestions = suggestions
    this.lemmatizable = lemmatizable
    this.suggested = suggested
  }

  get hasLemma(): boolean {
    return !_.isEmpty(this.uniqueLemma)
  }

  setUniqueLemma(
    uniqueLemma: UniqueLemma,
    suggested = false,
  ): LemmatizationToken {
    return produce((draft: Draft<LemmatizationToken>, uniqueLemma) => {
      draft.uniqueLemma = uniqueLemma
      draft.suggested = suggested
    })(this, uniqueLemma)
  }

  applySuggestion(): LemmatizationToken {
    if (this.suggestions?.length === 1 && !this.hasLemma) {
      return this.setUniqueLemma(this.suggestions[0], true)
    } else {
      return this
    }
  }

  clearSuggestionFlag(): LemmatizationToken {
    return produce(this, (draft: Draft<LemmatizationToken>) => {
      draft.suggested = false
    })
  }

  toDto(): LemmatizationTokenDto {
    return _.isNil(this.uniqueLemma)
      ? {
          value: this.value,
        }
      : {
          value: this.value,
          uniqueLemma: (this.uniqueLemma || []).map((lemma) => lemma.value),
        }
  }
}

export default class Lemmatization {
  [immerable] = true
  readonly lines: ReadonlyArray<string>
  readonly tokens: ReadonlyArray<ReadonlyArray<LemmatizationToken>>

  constructor(
    lines: ReadonlyArray<string>,
    tokens: ReadonlyArray<ReadonlyArray<LemmatizationToken>>,
  ) {
    this.lines = lines
    this.tokens = tokens
  }

  getRowPrefix(rowIndex: number): string {
    return this.lines[rowIndex]
  }

  setLemma(
    rowIndex: number,
    columnIndex: number,
    uniqueLemma: UniqueLemma,
  ): Lemmatization {
    return produce(this, (draft: Draft<Lemmatization>) => {
      draft.tokens[rowIndex][columnIndex] = castDraft(
        this.tokens[rowIndex][columnIndex].setUniqueLemma(uniqueLemma),
      )
    })
  }

  applySuggestions(): Lemmatization {
    return this.mapTokens((token) => token.applySuggestion())
  }

  clearSuggestionFlags(): Lemmatization {
    return this.mapTokens((token) => token.clearSuggestionFlag())
  }

  toDto(): ReadonlyArray<ReadonlyArray<LemmatizationTokenDto>> {
    return this.tokens.map((row) => row.map((token) => token.toDto()))
  }

  private mapTokens(
    iteratee: (token: LemmatizationToken) => LemmatizationToken,
  ): Lemmatization {
    return produce(this, (draft: Draft<Lemmatization>) => {
      draft.tokens = castDraft(this.tokens.map((row) => row.map(iteratee)))
    })
  }
}
