import React from 'react'
import { render, screen } from '@testing-library/react'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import StaticScoreContent, {
  formatManuscriptLine,
  pendingText,
  SiglumLookup,
  splitRows,
} from 'corpus/ui/edit-lite/StaticScoreContent'

const sigla: SiglumLookup = new Map([
  [1, 'NinNA1a'],
  [2, 'BabaNBSch1'],
])

function renderContent(
  line: LineOutline,
  draft: Line | null,
  isDirty = false,
  error: string | null = null,
): void {
  render(
    <StaticScoreContent
      line={line}
      draft={draft}
      sigla={sigla}
      isDirty={isDirty}
      error={error}
    />,
  )
}

function rowTexts(): (string | null)[] {
  return screen
    .getAllByText(/./, { selector: '.edit-lite-score-line__row' })
    .map((row) => row.textContent)
}

test.each([
  ['', []],
  ['one row', ['one row']],
  ['first\nsecond', ['first', 'second']],
])('splits %j into rows', (text: string, rows: string[]) => {
  expect(splitRows(text)).toEqual(rows)
})

test.each([
  [['o', 'i'], "6'", '[x x x] e-li-iš', "o i 6'. [x x x] e-li-iš"],
  [[], '8', 'ap-su-um-ma', '8. ap-su-um-ma'],
  [['o'], '1', 'kur\n$ single ruling', 'o 1. kur\n$ single ruling'],
  [['r'], '', '$ end of side', 'r $ end of side'],
  [['o'], '3', '', 'o 3.'],
  [[], '', '', ''],
])(
  'formats labels %j, number %j and text %j',
  (labels: string[], number: string, atf: string, expected: string) => {
    expect(
      formatManuscriptLine(
        createManuscriptLine({ manuscriptId: 1, labels, number, atf }),
      ),
    ).toBe(expected)
  },
)

test('shows the outline with pending manuscript rows before the line is loaded', () => {
  renderContent(buildEditLiteOutline().lines[0], null)

  expect(screen.getByText('1')).toBeVisible()
  expect(screen.getByText('When on high')).toBeVisible()
  expect(screen.getByText('translation in Arabic')).toBeVisible()
  expect(screen.getByText('%n enūma | eliš')).toBeVisible()
  expect(screen.getByText('#note: a note')).toBeVisible()
  expect(rowTexts()).toEqual([
    `NinNA1a ${pendingText}`,
    `BabaNBSch1 ${pendingText}`,
  ])
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('shows the manuscript lines of a loaded line', () => {
  const lines = buildEditLiteLines()
  renderContent(buildEditLiteOutline(lines).lines[0], lines[0])

  expect(rowTexts()).toEqual([
    'NinNA1a o 1. e-nu-ma e-liš',
    "BabaNBSch1 o i 6'. [x x x] e-li-iš",
  ])
})

test('shows every variant with its own manuscript lines', () => {
  const lines = buildEditLiteLines()
  renderContent(buildEditLiteOutline(lines).lines[1], lines[1])

  expect(screen.getByText('Nor below')).toBeVisible()
  expect(screen.getByText('%n šapliš | ammatu')).toBeVisible()
  expect(screen.getByText('%n šapliš | erṣetu')).toBeVisible()
  expect(rowTexts()).toEqual(['NinNA1a o 2. šap-liš am-ma-tu'])
})

test('prefers the draft to the outline', () => {
  const outline = buildEditLiteOutline()
  const draft = createLine({
    number: '1a',
    translation: '#tr.de: Als oben',
    variants: [
      createVariant({
        reconstruction: '%n enūma',
        manuscripts: [
          createManuscriptLine({
            manuscriptId: 2,
            labels: ['r'],
            number: '4',
            atf: 'e-nu-ma\n$ single ruling',
          }),
        ],
      }),
    ],
  })
  renderContent(outline.lines[0], draft)

  expect(screen.getByText('1a')).toBeVisible()
  expect(screen.getByText('Als oben')).toBeVisible()
  expect(screen.getByText('%n enūma')).toBeVisible()
  expect(screen.queryByText('When on high')).not.toBeInTheDocument()
  expect(screen.queryByText('#note: a note')).not.toBeInTheDocument()
  expect(rowTexts()).toEqual(['BabaNBSch1 r 4. e-nu-ma\n$ single ruling'])
})

test('marks manuscripts that are not in the chapter as unknown', () => {
  const lines = [
    createLine({
      number: '7',
      variants: [
        createVariant({
          reconstruction: 'kur',
          manuscripts: [
            createManuscriptLine({ manuscriptId: 0, number: '1', atf: 'kur' }),
          ],
        }),
      ],
    }),
  ]
  const [line] = buildEditLiteOutline(lines).lines
  renderContent(line, null)

  expect(rowTexts()).toEqual([`<unknown> ${pendingText}`])
})

test('shows an unknown manuscript of a loaded line', () => {
  const lines = [
    createLine({
      number: '7',
      variants: [
        createVariant({
          reconstruction: 'kur',
          manuscripts: [
            createManuscriptLine({ manuscriptId: 9, number: '1', atf: 'kur' }),
          ],
        }),
      ],
    }),
  ]
  renderContent(buildEditLiteOutline(lines).lines[0], lines[0])

  expect(rowTexts()).toEqual(['<unknown> 1. kur'])
})

test('shows a line without translation, variants or manuscripts', () => {
  const lines = [createLine({ number: '9' })]
  renderContent(buildEditLiteOutline(lines).lines[0], lines[0])

  expect(screen.getByText('9')).toBeVisible()
  expect(
    screen.queryByText(/./, { selector: '.edit-lite-score-line__row' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByText(/./, {
      selector: '.edit-lite-score-line__translation',
    }),
  ).not.toBeInTheDocument()
})

test('shows the edited marker and an error', () => {
  renderContent(buildEditLiteOutline().lines[2], null, true, 'Network down')

  expect(screen.getByText('edited')).toBeVisible()
  expect(screen.getByText('Network down')).toBeVisible()
})
