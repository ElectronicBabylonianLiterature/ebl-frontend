import $ from 'jquery'
import rgbHex from 'rgb-hex'
import { jsPDF } from 'jspdf'

export type PdfHtmlNode = HTMLElement | Text | Comment | Document

export function getLineHeight(doc: jsPDF): number {
  return doc.getFontSize() / 2
}

export function centerText(doc: jsPDF, text: string): number {
  const textWidth = getTextWidth(doc, text)
  const textOffset = (doc.internal.pageSize.width - textWidth) / 2
  return textOffset
}

export function getTextWidth(doc, text: string): number {
  return text
    ? (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor
    : 0
}

export function getTextHeight(doc: jsPDF, text: string): number {
  return doc.getTextDimensions(text).h
}

export function checkIfNewPage(yPos: number, doc: jsPDF): boolean {
  if (yPos >= doc.internal.pageSize.height - 10) {
    return true
  } else return false
}

export function startNewPageIfNeeded(yPos: number, doc: jsPDF): number {
  if (checkIfNewPage(yPos, doc)) {
    doc.addPage()
    return 15
  }
  return yPos
}

export function moveOneRowDown(yPos: number, doc: jsPDF): number {
  yPos += getLineHeight(doc) + 0.6
  return yPos
}

export function addText(
  text: string,
  xPos: number,
  yPos: number,
  doc: jsPDF,
): number {
  doc.text(text, xPos, yPos)
  return getTextWidth(doc, text)
}

export function addSuperscriptText(
  el: PdfHtmlNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  const text = $(el).text()
  setDocStyle($(el) as JQuery<HTMLElement>, doc)
  return addText(text, xPos, yPos - getTextHeight(doc, text) / 2, doc)
}

export function hasLeadingTextNode(el: PdfHtmlNode): boolean {
  return (
    $(el).contents().text().length > 0 && $(el).contents()[0].nodeType === 3
  )
}

export function setDocStyle(el: JQuery, doc: jsPDF): void {
  const superScript = el.is('sup')
  const allSmall = el.css('font-variant') === 'all-small-caps'

  if (el.css('font-style') === 'italic' || el.is('em'))
    doc.setFont('JunicodeItalic', 'normal')
  else doc.setFont('Junicode', 'normal')

  if (allSmall) doc.setFontSize(7)
  if (superScript) doc.setFontSize(7)
  if (!superScript && !allSmall) doc.setFontSize(10)

  doc.setTextColor(el.css('color') ? '#' + rgbHex(el.css('color')) : '#ffffff')
}

export function getTransliterationText(
  el: PdfHtmlNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
  add: boolean,
): number {
  setDocStyle($(el) as JQuery<HTMLElement>, doc)

  const superScript: boolean = $(el).is('sup') ? true : false

  let wordLength = 0

  if (
    ($(el).children().length === 0 &&
      $(el).text().trim().length &&
      $(el).parent().css('display') !== 'none') ||
    $(el).hasClass('Transliteration__wordSeparator')
  ) {
    const text = $(el).text()
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const width = getTextWidth(doc, char)
      if (superScript) {
        if (add)
          doc.text(char, xPos + wordLength, yPos - getTextHeight(doc, char) / 2)
      } else {
        if (add) doc.text(char, xPos + wordLength, yPos)
      }
      wordLength += width + 0.2
    }
  }

  return wordLength
}
