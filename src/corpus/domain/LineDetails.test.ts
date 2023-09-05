import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { implicitFirstColumn } from 'test-support/lines/text-columns'
import textLine from 'test-support/lines/text-line'
import { EmptyLine } from 'transliteration/domain/line'
import { LineDetails } from './line-details'
import { compareManuscripts } from './manuscript'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'

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
  [
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [],
        }),
      ],
      0
    ),
    1,
  ],
  [
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [empty],
        }),
      ],

      0
    ),
    1,
  ],
  [
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [oneColumn],
        }),
      ],
      0
    ),
    textLine.numberOfColumns,
  ],
  [
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [manyColumns],
        }),
      ],
      0
    ),
    implicitFirstColumn.numberOfColumns,
  ],
  [
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [empty, manyColumns],
        }),
      ],
      0
    ),
    implicitFirstColumn.numberOfColumns,
  ],
  [
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [manyColumns],
        }),
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [oneColumn],
          originalIndex: 1,
          isPrimaryVariant: false,
        }),
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
      lineVariantDisplayFactory.build({
        reconstruction: [],
        manuscripts: [manyColumns],
      }),
      lineVariantDisplayFactory.build({
        reconstruction: [],
        manuscripts: [oneColumn],
        originalIndex: 1,
        isPrimaryVariant: false,
      }),
    ],
    0
  )

  expect(lineDetails.sortedManuscripts).toEqual(
    [manyColumns, oneColumn].sort(compareManuscripts)
  )
})
