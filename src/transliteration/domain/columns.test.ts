import {
  emptyFirstColumn,
  firstColumnSpan,
  implicitFirstColumn,
  span,
} from 'test-support/lines/text-columns'
import { lemmatized } from 'test-support/lines/text-lemmatization'
import {
  containsColumns,
  createColumns,
  maxColumns,
  numberOfColumns,
} from './columns'

test.each([
  [lemmatized[0], false],
  [emptyFirstColumn, true],
  [firstColumnSpan, true],
  [implicitFirstColumn, true],
  [span, true],
])('hasColumns', (line, expected) => {
  expect(containsColumns(line.content)).toEqual(expected)
})

test.each([
  [
    emptyFirstColumn,
    [
      {
        span: 1,
        content: [],
      },
      {
        span: 1,
        content: [emptyFirstColumn.content[1]],
      },
      {
        span: 1,
        content: [emptyFirstColumn.content[3]],
      },
      {
        span: 1,
        content: [emptyFirstColumn.content[5]],
      },
    ],
  ],
  [
    implicitFirstColumn,
    [
      {
        span: 1,
        content: [implicitFirstColumn.content[0]],
      },
      {
        span: 1,
        content: [implicitFirstColumn.content[2]],
      },
    ],
  ],
  [
    firstColumnSpan,
    [
      {
        span: 2,
        content: [firstColumnSpan.content[1]],
      },
      {
        span: 1,
        content: [firstColumnSpan.content[3]],
      },
    ],
  ],
  [
    span,
    [
      {
        span: 1,
        content: [span.content[0]],
      },
      {
        span: 2,
        content: [span.content[2]],
      },
    ],
  ],
  [
    lemmatized[0],
    [
      {
        span: null,
        content: lemmatized[0].content,
      },
    ],
  ],
])('columns', (line, expected) => {
  expect(createColumns(line.content)).toEqual(expected)
})

test.each([
  [lemmatized[0], 1],
  [emptyFirstColumn, 4],
  [implicitFirstColumn, 2],
  [firstColumnSpan, 3],
  [span, 3],
])('numberOfColumns', (line, expected) => {
  expect(numberOfColumns(createColumns(line.content))).toEqual(expected)
})

test('maxColumns', () => {
  const columns = [
    createColumns(emptyFirstColumn.content),
    createColumns(implicitFirstColumn.content),
  ]
  expect(maxColumns(columns)).toEqual(4)
})
