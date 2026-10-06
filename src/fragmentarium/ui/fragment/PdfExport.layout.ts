import $ from 'jquery'
import rgbHex from 'rgb-hex'
import { jsPDF } from 'jspdf'

export type PdfNode = Element | Text | Comment | Document

export function getLineHeight(doc: jsPDF): number {
  return doc.getFontSize() / 2
}

export function centerText(doc: jsPDF, text: string): number {
  const textWidth = getTextWidth(doc, text)
  const textOffset = (doc.internal.pageSize.width - textWidth) / 2
  return textOffset
}

export function getTextWidth(doc: jsPDF, text: string): number {
  return text
    ? (doc.getStringUnitWidth(text) * doc.getFontSize()) /
        doc.internal.scaleFactor
    : 0
}

export function getTextHeight(doc: jsPDF, text: string): number {
  return doc.getTextDimensions(text).h
}

export function moveOneRowDown(yPos: number, doc: jsPDF): number {
  yPos += getLineHeight(doc) + 0.6
  return yPos
}

export function checkIfNewPage(yPos: number, doc: jsPDF): boolean {
  if (yPos >= doc.internal.pageSize.height - 10) {
    return true
  } else return false
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

export function startsWithText(element: JQuery<PdfNode>): boolean {
  return (
    element.contents().text().length > 0 &&
    element.contents()[0].nodeType === Node.TEXT_NODE
  )
}

function isVisibleText(element: JQuery<PdfNode>): boolean {
  return (
    element.children().length === 0 &&
    element.text().trim().length > 0 &&
    element.parent().css('display') !== 'none'
  )
}

function transliterationCharacters(el: PdfNode, doc: jsPDF): string[] {
  const element = $(el)
  setDocStyle(element, doc)
  return isVisibleText(element) ||
    element.hasClass('Transliteration__wordSeparator')
    ? element.text().split('')
    : []
}

function characterAdvance(doc: jsPDF, character: string): number {
  return getTextWidth(doc, character) + 0.2
}

export function measureTransliteration(el: PdfNode, doc: jsPDF): number {
  return transliterationCharacters(el, doc).reduce(
    (width, character) => width + characterAdvance(doc, character),
    0,
  )
}

export function writeTransliteration(
  el: PdfNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  const isSuperscript = $(el).is('sup')
  return transliterationCharacters(el, doc).reduce((width, character) => {
    const advance = characterAdvance(doc, character)
    const characterYPos = isSuperscript
      ? yPos - getTextHeight(doc, character) / 2
      : yPos
    doc.text(character, xPos + width, characterYPos)
    return width + advance
  }, 0)
}

export function setDocStyle(el: JQuery<PdfNode>, doc: jsPDF): void {
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

export type PdfNodeWriter = (
  el: PdfNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
) => number

function nextRow(yPos: number, doc: jsPDF): number {
  const nextYPos = yPos + 5.6
  if (checkIfNewPage(nextYPos, doc)) {
    doc.addPage()
    return 15
  }
  return nextYPos
}

export function writeWrappedBlocks(
  blocks: JQuery,
  padding: number,
  yPos: number,
  doc: jsPDF,
  writeNode: PdfNodeWriter,
): number {
  blocks.each((i, block) => {
    let linePos = padding

    $(block)
      .contents()
      .each((j, el) => {
        if (linePos > doc.internal.pageSize.width - padding) {
          linePos = padding
          yPos = nextRow(yPos, doc)
        }
        linePos += writeNode(el, doc, linePos, yPos)
      })
    yPos = nextRow(yPos, doc)
  })
  return yPos
}
