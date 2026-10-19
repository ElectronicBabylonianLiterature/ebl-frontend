import { lemmatized } from 'test-support/lines/text-lemmatization'
import { emptyFirstColumn } from 'test-support/lines/text-columns'
import { firstColumnSpan, span } from 'test-support/lines/text-columns-spans'
import { implicitFirstColumn } from 'test-support/lines/text-columns-implicit'
import { createColumns, numberOfColumns } from 'transliteration/domain/columns'

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
