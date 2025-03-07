import React, { FunctionComponent, useState } from 'react'
import _ from 'lodash'
import DictionaryWord from 'dictionary/domain/Word'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from './LineLemmasContext'
import { LineAccumulator, TokenActionWrapperProps } from './LineAccumulator'
import {
  TextLineColumn,
  updatePhoneticPropsContext,
} from 'transliteration/domain/columns'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'

export function LineTokens({
  content,
  TokenActionWrapper,
}: {
  content: ReadonlyArray<Token>
  TokenActionWrapper?: FunctionComponent<TokenActionWrapperProps>
}): JSX.Element {
  return (
    <>
      {
        content.reduce((acc: LineAccumulator, token: Token, index: number) => {
          acc.addColumnToken(
            token,
            index,
            {},
            token.isHighlighted ? ['highlight'] : []
          )
          return acc
        }, new LineAccumulator(false, false, false, TokenActionWrapper))
          .flatResult
      }
    </>
  )
}

export function LineColumns({
  columns,
  maxColumns,
  isInLineGroup = false,
  showMeter,
  showIpa,
  phoneticProps,
  highlightLemmas,
  TokenActionWrapper,
}: {
  columns: readonly TextLineColumn[]
  maxColumns: number
  isInLineGroup?: boolean
  showMeter?: boolean
  showIpa?: boolean
  phoneticProps?: PhoneticProps
  highlightLemmas?: readonly string[]
  TokenActionWrapper?: FunctionComponent<TokenActionWrapperProps>
}): JSX.Element {
  const lineAccumulator = columns.reduce((acc: LineAccumulator, column) => {
    acc.addColumn(column.span)
    column.content.reduce(
      (acc: LineAccumulator, token: Token, index: number) => {
        acc.addColumnToken(
          token,
          index,
          updatePhoneticPropsContext(column.content, index, phoneticProps),
          _.isEmpty(_.intersection(token.uniqueLemma, highlightLemmas))
            ? []
            : ['highlight']
        )
        return acc
      },
      acc
    )
    return acc
  }, new LineAccumulator(isInLineGroup, showMeter, showIpa, TokenActionWrapper))

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
  readonly siglum: string | null = null
  readonly alignment: number
  readonly cleanValue = 'ø'
  public static readonly cleanValue = 'ø'
  readonly isVariant = true
  readonly uniqueLemma: readonly string[] = [this.cleanValue]
  readonly type = 'EmptyLineToken'

  constructor(siglum: string, alignment: number) {
    this.siglum = siglum
    this.alignment = alignment
  }
}

export type OneOfLineToken = LineToken | EmptyLineToken
