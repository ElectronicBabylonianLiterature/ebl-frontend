import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { implicitFirstColumn } from 'test-support/lines/text-columns'
import textLine from 'test-support/lines/text-line'
import { EmptyLine } from 'transliteration/domain/line'
import { LineDetails, LineVariantDisplay } from './line-details'
import { compareManuscripts } from './manuscript'

const empty = manuscriptLineDisplayFactory.build(
  {},
  { associations: { line: new EmptyLine() } }
)
const oneColumn = manuscriptLineDisplayFactory.build(
  {},
  { associations: { line: textLine } }
)
const manyColumns = manuscriptLineDisplayFactory.build(
  {},
  { associations: { line: implicitFirstColumn } }
)

test.each([
  [new LineDetails([]), 1],
  [new LineDetails([new LineVariantDisplay([])]), 1],
  [new LineDetails([new LineVariantDisplay([empty])]), 1],
  [
    new LineDetails([new LineVariantDisplay([oneColumn])]),
    textLine.numberOfColumns,
  ],
  [
    new LineDetails([new LineVariantDisplay([manyColumns])]),
    implicitFirstColumn.numberOfColumns,
  ],
  [
    new LineDetails([new LineVariantDisplay([empty, manyColumns])]),
    implicitFirstColumn.numberOfColumns,
  ],
  [
    new LineDetails([
      new LineVariantDisplay([manyColumns]),
      new LineVariantDisplay([oneColumn]),
    ]),
    implicitFirstColumn.numberOfColumns,
  ],
])('numberOfColumns %s', (line, expected) => {
  expect(line.numberOfColumns).toEqual(expected)
})

test('sortedManuscripts', () => {
  const lineDetails = new LineDetails([
    new LineVariantDisplay([manyColumns]),
    new LineVariantDisplay([oneColumn]),
  ])

  expect(lineDetails.sortedManuscripts).toEqual(
    [manyColumns, oneColumn].sort(compareManuscripts)
  )
})
