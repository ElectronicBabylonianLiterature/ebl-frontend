import _ from 'lodash'
import { Token } from './token'
import { isColumn } from './type-guards'

export interface TextLineColumn {
  span: number | null
  content: Token[]
}

export const defaultSpan = 1

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