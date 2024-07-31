import _ from 'lodash'
import { Token } from './token'
import { isAkkadianWord, isColumn } from './type-guards'
import {
  AnnotationLineAccumulator,
  LineAccumulator,
} from 'transliteration/ui/LineAccumulator'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'

export interface TextLineColumn {
  span: number | null
  content: Token[]
}

function updatePhoneticPropsContext(
  content: Token[],
  index: number,
  phoneticProps?: PhoneticProps
): PhoneticProps {
  const previousWord = _.find(content.slice(0, index).reverse(), (token) =>
    isAkkadianWord(token)
  )
  const nextWord = _.find(content.slice(index + 1), (token) =>
    isAkkadianWord(token)
  )
  return {
    ...phoneticProps,
    wordContext: {
      ...(previousWord &&
        isAkkadianWord(previousWord) && {
          previousWord,
        }),
      ...(nextWord &&
        isAkkadianWord(nextWord) && {
          nextWord,
        }),
    },
  }
}

export const defaultSpan = 1

export function lineAccFromColumns({
  columns,
  isInLineGroup = false,
  showMeter = false,
  showIpa = false,
  phoneticProps,
  highlightLemmas = [],
  isInPopover,
}: {
  columns: readonly TextLineColumn[]
  isInLineGroup?: boolean
  showMeter?: boolean
  showIpa?: boolean
  phoneticProps?: PhoneticProps
  highlightLemmas: readonly string[]
  isInPopover?: boolean
}): LineAccumulator {
  return columns.reduce((acc: LineAccumulator, column) => {
    acc.addColumn(column.span)
    column.content.reduce(
      (acc: LineAccumulator, token: Token, index: number) => {
        acc.addColumnToken(
          token,
          index,
          updatePhoneticPropsContext(column.content, index, phoneticProps),
          _.isEmpty(_.intersection(token.uniqueLemma, highlightLemmas))
            ? []
            : ['highlight'],
          isInPopover
        )
        return acc
      },
      acc
    )
    return acc
  }, new LineAccumulator(isInLineGroup, showMeter, showIpa))
}

export function annotationLineAccFromColumns(
  columns: readonly TextLineColumn[]
): AnnotationLineAccumulator {
  return columns.reduce((acc: AnnotationLineAccumulator, column) => {
    acc.addColumn(column.span)
    column.content.reduce(
      (acc: AnnotationLineAccumulator, token: Token, index: number) => {
        acc.addColumnToken(token, index)
        return acc
      },
      acc
    )
    return acc
  }, new AnnotationLineAccumulator())
}

export function numberOfColumns(columns: readonly TextLineColumn[]): number {
  return _(columns)
    .map((column) => column.span ?? defaultSpan)
    .sum()
}

export function maxColumns(lines: readonly TextLineColumn[][]): number {
  return _(lines).map(numberOfColumns).max() ?? 1
}

export function containsColumns(tokens: readonly Token[]): boolean {
  return tokens.some(isColumn)
}

export function createColumns(tokens: readonly Token[]): TextLineColumn[] {
  const hasColumns = containsColumns(tokens)
  return _.reduce<Token, TextLineColumn[]>(
    tokens,
    (columns, current) => {
      if (isColumn(current)) {
        if (_.isEmpty(columns) && current.number === null) {
          columns.push({
            span: defaultSpan,
            content: [],
          })
        }
        columns.push({
          span: current.number ?? defaultSpan,
          content: [],
        })
      } else if (_.isEmpty(columns)) {
        columns.push({
          span: hasColumns ? 1 : null,
          content: [current],
        })
      } else {
        _.last(columns)?.content.push(current)
      }
      return columns
    },
    []
  )
}
