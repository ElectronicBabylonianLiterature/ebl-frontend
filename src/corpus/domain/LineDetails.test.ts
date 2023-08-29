import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { implicitFirstColumn } from 'test-support/lines/text-columns'
import textLine from 'test-support/lines/text-line'
import { EmptyLine } from 'transliteration/domain/line'
import { LineDetails, LineVariantDetails } from './line-details'
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
  [new LineDetails([], 0), 1],
  [new LineDetails([new LineVariantDetails(0, [], null, [], [], [])], 0), 1],
  [
    new LineDetails([new LineVariantDetails(0, [], null, [empty], [], [])], 0),
    1,
  ],
  [
    new LineDetails(
      [new LineVariantDetails(0, [], null, [oneColumn], [], [])],
      0
    ),
    textLine.numberOfColumns,
  ],
  [
    new LineDetails(
      [new LineVariantDetails(0, [], null, [manyColumns], [], [])],
      0
    ),
    implicitFirstColumn.numberOfColumns,
  ],
  [
    new LineDetails(
      [new LineVariantDetails(0, [], null, [empty, manyColumns], [], [])],
      0
    ),
    implicitFirstColumn.numberOfColumns,
  ],
  [
    new LineDetails(
      [
        new LineVariantDetails(0, [], null, [manyColumns], [], []),
        new LineVariantDetails(1, [], null, [oneColumn], [], []),
      ],
      0
    ),
    implicitFirstColumn.numberOfColumns,
  ],
])('numberOfColumns %s', (line, expected) => {
  expect(line.numberOfColumns).toEqual(expected)
})

test('sortedManuscripts', () => {
  const lineDetails = new LineDetails(
    [
      new LineVariantDetails(0, [], null, [manyColumns], [], []),
      new LineVariantDetails(1, [], null, [oneColumn], [], []),
    ],
    0
  )

  expect(lineDetails.sortedManuscripts).toEqual(
    [manyColumns, oneColumn].sort(compareManuscripts)
  )
})
