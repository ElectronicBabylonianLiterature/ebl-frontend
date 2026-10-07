import $ from 'jquery'
import {
  cell,
  exportMarkup,
  glyphCount,
  pageStreams,
  rowCount,
  table,
  textLine,
  word,
  words,
} from 'fragmentarium/ui/fragment/PdfExport.testSupport'

jest.mock(
  'transliteration/ui/TransliterationLines',
  () =>
    jest.requireActual('fragmentarium/ui/fragment/PdfExport.markup.testSupport')
      .linesModule,
)
jest.mock(
  'transliteration/ui/TransliterationNotes',
  () =>
    jest.requireActual('fragmentarium/ui/fragment/PdfExport.markup.testSupport')
      .notesModule,
)
jest.mock(
  'transliteration/ui/Glossary',
  () =>
    jest.requireActual('fragmentarium/ui/fragment/PdfExport.markup.testSupport')
      .glossaryModule,
)

const spilledRow = (...cells: string[]): string =>
  table(
    textLine(1, cell(words(1500)), ...cells.map((content) => cell(content))),
  )

describe('a line wider than its column', () => {
  it('wraps onto further rows', async () => {
    const short = await exportMarkup({
      lines: table(textLine(1, cell(words(3)))),
    })
    const long = await exportMarkup({
      lines: table(textLine(1, cell(words(100)))),
    })

    expect(long.getNumberOfPages()).toBe(1)
    expect(rowCount(long)).toBeGreaterThan(rowCount(short) + 1)
  })

  it('continues on a new page when it reaches the bottom', async () => {
    const doc = await exportMarkup({ lines: spilledRow() })

    expect(doc.getNumberOfPages()).toBe(2)
    expect(glyphCount(pageStreams(doc)[1])).toBeGreaterThan(0)
  })

  it('draws the next cell on the original page of the row', async () => {
    const empty = await exportMarkup({ lines: spilledRow(word(''), word('')) })
    const filled = await exportMarkup({
      lines: spilledRow(word('ab'), word('cd')),
    })

    const [emptyFirst, emptySecond] = pageStreams(empty).map(glyphCount)
    const [filledFirst, filledSecond] = pageStreams(filled).map(glyphCount)
    expect(filledFirst).toBe(emptyFirst + 2)
    expect(filledSecond).toBe(emptySecond + 2)
  })
})

it('draws neither hidden nor blank text', async () => {
  const visible = await exportMarkup({
    lines: table(textLine(1, cell(word('ab')))),
  })
  const withHidden = await exportMarkup({
    lines: table(
      textLine(
        1,
        cell(
          `${word('ab')}<span style="display: none"> <span>hidden</span></span><span>   </span>`,
        ),
      ),
    ),
  })

  expect(pageStreams(withHidden).map(glyphCount)).toEqual(
    pageStreams(visible).map(glyphCount),
  )
})

it('starts a new page when the rows reach the bottom', async () => {
  const rows = Array.from({ length: 80 }, (_, index) =>
    textLine(index + 1, cell(words(2))),
  )
  const doc = await exportMarkup({ lines: table(...rows) })

  expect(doc.getNumberOfPages()).toBe(2)
  expect(glyphCount(pageStreams(doc)[1])).toBeGreaterThan(0)
})

it('lays out a cell with an empty colspan like a single column', async () => {
  const plain = await exportMarkup({
    lines: table(textLine(1, cell(words(60)))),
  })
  const emptyColspan = await exportMarkup({
    lines: table(textLine(1, cell(words(60), ' colspan=""'))),
  })

  expect(pageStreams(emptyColspan)).toEqual(pageStreams(plain))
})

it('sizes the columns by their rendered share of the table width', async () => {
  const lines = table(textLine(1, cell(words(10)), cell(word('x'))))
  const unmeasured = await exportMarkup({ lines })
  const outerWidth = jest
    .spyOn($.fn, 'outerWidth')
    .mockImplementation(function (this: JQuery) {
      return this.is('tbody') ? 400 : 100
    })
  const measured = await exportMarkup({ lines })
  outerWidth.mockRestore()

  expect(rowCount(measured)).toBeGreaterThan(rowCount(unmeasured))
})
