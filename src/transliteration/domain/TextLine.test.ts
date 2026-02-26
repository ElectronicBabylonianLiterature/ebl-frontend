import { lemmatized } from 'test-support/lines/text-lemmatization'
import {
  emptyFirstColumn,
  firstColumnSpan,
  implicitFirstColumn,
  span,
} from 'test-support/lines/text-columns'
import { createColumns, numberOfColumns } from './columns'

test.each([
  emptyFirstColumn,
  implicitFirstColumn,
  firstColumnSpan,
  span,
  lemmatized[0],
])('columns', (line) => {
  expect(line.columns).toEqual(createColumns(line.content))
})

test.each([
  lemmatized[0],
  emptyFirstColumn,
  implicitFirstColumn,
  firstColumnSpan,
  span,
])('numberOfColumns', (line) => {
  expect(line.numberOfColumns).toEqual(
    numberOfColumns(createColumns(line.content)),
  )
})
