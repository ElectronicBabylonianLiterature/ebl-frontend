import $ from 'jquery'
import { jsPDF } from 'jspdf'
import {
  getTransliterationText,
  setDocStyle,
  startNewPageIfNeeded,
} from 'fragmentarium/ui/fragment/PdfExportText'
import {
  createContainer,
  createPdfDoc,
  textCalls,
} from 'fragmentarium/ui/fragment/PdfExport.testSupport'

let doc: jsPDF

beforeEach(() => {
  doc = createPdfDoc()
})

describe('setDocStyle', () => {
  it('uses the italic font and default color for emphasis', () => {
    setDocStyle($('<em>a</em>'), doc)

    expect(doc.setFont).toHaveBeenCalledWith('JunicodeItalic', 'normal')
    expect(doc.setFontSize).toHaveBeenCalledWith(10)
    expect(doc.setTextColor).toHaveBeenCalledWith('#ffffff')
  })

  it('uses the italic font and the element color for italic styles', () => {
    setDocStyle(
      $('<span style="font-style: italic; color: rgb(0, 0, 255)">a</span>'),
      doc,
    )

    expect(doc.setFont).toHaveBeenCalledWith('JunicodeItalic', 'normal')
    expect(doc.setTextColor).toHaveBeenCalledWith('#0000ff')
  })

  it('uses the small font size for small caps', () => {
    setDocStyle($('<span style="font-variant: all-small-caps">a</span>'), doc)

    expect(doc.setFont).toHaveBeenCalledWith('Junicode', 'normal')
    expect(doc.setFontSize).toHaveBeenCalledWith(7)
    expect(doc.setFontSize).not.toHaveBeenCalledWith(10)
  })
})

describe('getTransliterationText', () => {
  it('raises superscript characters', () => {
    const width = getTransliterationText(
      $('<sup>2</sup>')[0],
      doc,
      10,
      20,
      true,
    )

    expect(width).toBeGreaterThan(0)
    expect(doc.text).toHaveBeenCalledWith('2', 10, expect.any(Number))
    expect((doc.text as jest.Mock).mock.calls[0][2]).toBeLessThan(20)
  })

  it('measures without adding text', () => {
    const width = getTransliterationText(
      $('<span>ab</span>')[0],
      doc,
      0,
      0,
      false,
    )

    expect(width).toBeGreaterThan(0)
    expect(doc.text).not.toHaveBeenCalled()
  })

  it('skips hidden text but keeps word separators', () => {
    const hidden = $(
      '<div style="display: none"><span>ab</span><span class="Transliteration__wordSeparator">-</span></div>',
    ).appendTo(createContainer())

    expect(
      getTransliterationText(hidden.children()[0], doc, 0, 0, true),
    ).toEqual(0)
    expect(
      getTransliterationText(hidden.children()[1], doc, 0, 0, true),
    ).toBeGreaterThan(0)
    expect(textCalls(doc)).toEqual(['-'])
  })
})

describe('startNewPageIfNeeded', () => {
  it('keeps the position on the current page', () => {
    expect(startNewPageIfNeeded(20, doc)).toEqual(20)
    expect(doc.addPage).not.toHaveBeenCalled()
  })

  it('starts a new page at the bottom of the page', () => {
    expect(startNewPageIfNeeded(290, doc)).toEqual(15)
    expect(doc.addPage).toHaveBeenCalledTimes(1)
  })
})
