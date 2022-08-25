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
          acc.addColumnToken(token)
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
  showMeter,
}: {
  columns: readonly { span: number | null; content: readonly Token[] }[]
  maxColumns: number
  isInLineGroup?: boolean
  showMeter?: boolean
}): JSX.Element {
  const lineAccumulator = columns.reduce((acc: LineAccumulator, column) => {
    acc.addColumn(column.span)
    column.content.reduce((acc: LineAccumulator, token: Token) => {
      acc.addColumnToken(token, isInLineGroup, showMeter)
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
  type = 'LineToken'

  constructor(token: LemmatizableToken, siglum: string | null = null) {
    this.token = token
    this.siglum = siglum
  }

  get alignment(): number | null {
    return this.token.alignment
  }

  get isVariant(): boolean {
    return !_.isNil(this.token.variant)
  }

  get cleanValue(): string {
    return this.token.cleanValue
  }

  get uniqueLemma(): readonly string[] {
    return this.token.uniqueLemma
  }
}

export class EmptyLineToken {
  siglum: string | null = null
  alignment: number
  cleanValue = 'ø'
  isVariant = true
  uniqueLemma: readonly string[] = ['ø']
  type = 'EmptyLineToken'

  constructor(siglum: string, alignment: number) {
    this.siglum = siglum
    this.alignment = alignment
  }
}

export type OneOfLineToken = LineToken | EmptyLineToken
