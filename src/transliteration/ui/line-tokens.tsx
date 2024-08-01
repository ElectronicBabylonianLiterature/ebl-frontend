import React, { useState } from 'react'
import _ from 'lodash'
import DictionaryWord from 'dictionary/domain/Word'
import { LemmatizableToken, Token } from 'transliteration/domain/token'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from './LineLemmasContext'
import { LineAccumulator } from './LineAccumulator'
import {
  annotationLineAccFromColumns,
  lineAccFromColumns,
  TextLineColumn,
} from 'transliteration/domain/columns'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from './line-number'

export function LineTokens({
  content,
  highlightTokens = [],
}: {
  content: ReadonlyArray<Token>
  highlightTokens?: number[]
}): JSX.Element {
  return (
    <>
      {
        content.reduce((acc: LineAccumulator, token: Token, index: number) => {
          acc.addColumnToken(
            token,
            index,
            {},
            highlightTokens.includes(index) ? ['highlight'] : []
          )
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
  showIpa,
  phoneticProps,
  highlightLemmas,
}: {
  columns: readonly TextLineColumn[]
  maxColumns: number
  isInLineGroup?: boolean
  showMeter?: boolean
  showIpa?: boolean
  phoneticProps?: PhoneticProps
  highlightLemmas?: readonly string[]
}): JSX.Element {
  const lineAccumulator = lineAccFromColumns({
    columns,
    isInLineGroup,
    showMeter,
    showIpa,
    phoneticProps,
    highlightLemmas: highlightLemmas ?? [],
  })

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

export function AnnotationLineColumns({
  line,
  lineIndex,
  columns,
  maxColumns,
}: {
  line: TextLine
  lineIndex: number
  columns: readonly TextLineColumn[]
  maxColumns: number
}): JSX.Element {
  const lineAccumulator = annotationLineAccFromColumns(columns)

  const sourceTextLine = (
    <tr className={'annotation-line__source'}>
      <td>
        <LineNumber line={line} />
      </td>
      {lineAccumulator.flatResult.map((token, index) => {
        return (
          <td key={index}>
            <span
              onClick={() =>
                console.log(
                  `clicked on token ${token.token.cleanValue} at line=${lineIndex}, index=${index}`,
                  token.token
                )
              }
            >
              {token.display()}
            </span>
          </td>
        )
      })}
    </tr>
  )
  const lemmaAnnotationLayer = (
    <tr className={'annotation-line__lemmatization'}>
      <td></td>
      {lineAccumulator.flatResult.map((token, index) => {
        return (
          <td key={index}>
            <span
              onClick={() =>
                console.log(
                  `clicked on lemma of token ${token.token.cleanValue} at line=${lineIndex}, index=${index}`,
                  token.token
                )
              }
            >
              {token.token.uniqueLemma}
            </span>
          </td>
        )
      })}
    </tr>
  )

  return (
    <>
      {sourceTextLine}
      {lemmaAnnotationLayer}
    </>
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
