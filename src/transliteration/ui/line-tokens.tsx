import React, { useState } from 'react'
import _ from 'lodash'
import DictionaryWord from 'dictionary/domain/Word'
import { Token, LemmatizableToken } from 'transliteration/domain/token'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from './LineLemmasContext'
import { LineAccumulator } from './LineAccumulator'

export function LineTokens({
  content,
}: {
  content: ReadonlyArray<Token>
}): JSX.Element {
  return (
    <>
      {
        content.reduce((acc: LineAccumulator, token: Token) => {
          acc.addColumnToken(token, false)
          return acc
        }, new LineAccumulator()).flatResult
      }
    </>
  )
}

export function LineColumns({
  columns,
  maxColumns,
  isInLineGroup = false,
}: {
  columns: readonly { span: number | null; content: readonly Token[] }[]
  maxColumns: number
  isInLineGroup?: boolean
}): JSX.Element {
  const lineAccumulator = columns.reduce((acc: LineAccumulator, column) => {
    acc.addColumn(column.span)
    column.content.reduce((acc: LineAccumulator, token: Token) => {
      acc.addColumnToken(token, isInLineGroup)
      return acc
    }, acc)
    return acc
  }, new LineAccumulator())
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
    createLemmaMap(lineAccumulator.lemmas)
  )

  return (
    <LineLemmasContext.Provider
      value={{
        lemmaMap: lemmaMap,
        lemmaSetter: lemmaSetter,
      }}
    >
      {lineAccumulator.getColumns(maxColumns)}
    </LineLemmasContext.Provider>
  )
}

export class LineToken {
  token: LemmatizableToken
  lemma: DictionaryWord[] | null = null
  siglum: string | null = null

  constructor(token: LemmatizableToken, siglum: string | null = null) {
    this.token = token
    this.siglum = siglum
  }

  public setLemma(lemma: DictionaryWord[]): void {
    this.lemma = lemma
  }

  get alignment(): number | null {
    return this.token.alignment
  }

  get isVariant(): boolean {
    return !_.isNil(this.token.variant)
  }

  get isManuscriptToken(): boolean {
    return !_.isNull(this.siglum)
  }

  get cleanValue(): string {
    return this.token.cleanValue
  }
}
