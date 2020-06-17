import { lemmatized } from 'test-support/lines/text-lemmatization'
import { columns, columnsWithSpan } from 'test-support/lines/text-columns'

test.each([
  [
    columns,
    [
      {
        span: 1,
        content: [columns.content[1]],
      },
      {
        span: 1,
        content: [columns.content[3]],
      },
      {
        span: 1,
        content: [columns.content[5]],
      },
    ],
  ],
  [
    columnsWithSpan,
    [
      {
        span: 2,
        content: [columns.content[1]],
      },
      {
        span: 1,
        content: [columns.content[3]],
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
  expect(line.columns).toEqual(expected)
})

test.each([
  [lemmatized[0], 1],
  [columns, 3],
  [columnsWithSpan, 3],
])('numberOfColumns', (line, expected) => {
  expect(line.numberOfColumns).toEqual(expected)
})
