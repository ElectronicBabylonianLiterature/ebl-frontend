import {
  exportMarkup,
  fontResource,
  glyphCount,
  pageStreams,
  repeat,
  rowCount,
  usesColor,
  usesFontSize,
  word,
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

const notes = (...items: string[]): string =>
  `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`
const links = (count: number): string => repeat(count, '<a>note</a>')
const noteLine = (content: string): string =>
  `<span class="Transliteration__NoteLine">${content}</span>`
const glossary = (...entries: string[]): string =>
  `<h4>Glossary</h4>${entries.map((entry) => `<div>${entry}</div>`).join('')}`

describe('footnotes', () => {
  it('wrap a note that is wider than the page', async () => {
    const short = await exportMarkup({ notes: notes(links(2)) })
    const long = await exportMarkup({ notes: notes(links(60)) })

    expect(long.getNumberOfPages()).toBe(1)
    expect(rowCount(long)).toBeGreaterThan(rowCount(short) + 1)
  })

  it('continue a wrapped note on a new page', async () => {
    const doc = await exportMarkup({ notes: notes(links(1500)) })

    expect(doc.getNumberOfPages()).toBeGreaterThan(1)
  })

  it('start a new page when the notes reach the bottom', async () => {
    const doc = await exportMarkup({
      notes: notes(...Array.from({ length: 80 }, () => links(1))),
    })

    expect(doc.getNumberOfPages()).toBe(2)
    expect(glyphCount(pageStreams(doc)[1])).toBeGreaterThan(0)
  })

  it('draw the text of note lines but skip blank and nested spans', async () => {
    const empty = await exportMarkup({ notes: notes(noteLine('')) })
    const doc = await exportMarkup({
      notes: notes(
        noteLine(
          `${word('ab')}${word('<span>c</span>')}<span> </span><span></span><em>de</em><span><em>f</em></span>`,
        ),
      ),
    })

    expect(glyphCount(pageStreams(doc)[0])).toBe(
      glyphCount(pageStreams(empty)[0]) + 5,
    )
  })

  it('raise superscripts in a smaller font', async () => {
    const plain = await exportMarkup({ notes: notes(links(1)) })
    const raised = await exportMarkup({ notes: notes('<sup>1</sup>') })

    expect(usesFontSize(plain, 7)).toBe(false)
    expect(usesFontSize(raised, 7)).toBe(true)
  })

  it('use an italic font for text styled italic', async () => {
    const plain = await exportMarkup({ notes: notes(links(1)) })
    const italic = await exportMarkup({
      notes: notes('<a style="font-style: italic">note</a>'),
    })

    const italicFont = fontResource(italic, 'JunicodeItalic')
    expect(pageStreams(plain)[0]).not.toContain(italicFont)
    expect(pageStreams(italic)[0]).toContain(italicFont)
  })

  it('use a smaller font for all small caps', async () => {
    const doc = await exportMarkup({
      notes: notes('<a style="font-variant: all-small-caps">note</a>'),
    })

    expect(usesFontSize(doc, 7)).toBe(true)
  })

  it('keep the color of the text', async () => {
    const plain = await exportMarkup({ notes: notes(links(1)) })
    const red = await exportMarkup({
      notes: notes('<a style="color: rgb(255, 0, 0)">note</a>'),
    })

    expect(usesColor(plain, '1. 0. 0.')).toBe(false)
    expect(usesColor(red, '1. 0. 0.')).toBe(true)
  })
})

describe('glossary', () => {
  it('is left out when it has no entries', async () => {
    const doc = await exportMarkup({ glossary: '<h4>Glossary</h4>' })

    expect(usesFontSize(doc, 14)).toBe(false)
  })

  it('gets a heading when it has entries', async () => {
    const doc = await exportMarkup({ glossary: glossary(links(1)) })

    expect(usesFontSize(doc, 14)).toBe(true)
  })

  it('wraps an entry that is wider than the page', async () => {
    const short = await exportMarkup({ glossary: glossary(links(2)) })
    const long = await exportMarkup({ glossary: glossary(links(60)) })

    expect(long.getNumberOfPages()).toBe(1)
    expect(rowCount(long)).toBeGreaterThan(rowCount(short) + 1)
  })

  it('continues a wrapped entry on a new page', async () => {
    const doc = await exportMarkup({ glossary: glossary(links(1500)) })

    expect(doc.getNumberOfPages()).toBeGreaterThan(1)
  })

  it('starts a new page when the entries reach the bottom', async () => {
    const doc = await exportMarkup({
      glossary: glossary(...Array.from({ length: 80 }, () => links(1))),
    })

    expect(doc.getNumberOfPages()).toBe(2)
    expect(glyphCount(pageStreams(doc)[1])).toBeGreaterThan(0)
  })
})
