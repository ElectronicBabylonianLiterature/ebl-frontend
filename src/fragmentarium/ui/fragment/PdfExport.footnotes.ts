import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import {
  PdfNode,
  addText,
  getTextHeight,
  setDocStyle,
  startsWithText,
  writeTransliteration,
  writeWrappedBlocks,
} from 'fragmentarium/ui/fragment/PdfExport.layout'

export function addFootnotes(
  notes: JQuery,
  padding: number,
  jQueryRef: JQuery,
  yPos: number,
  doc: jsPDF,
) {
  notes.hide()
  jQueryRef.append(notes)

  fixHtmlParseOrder(notes)

  const lis: JQuery = notes.find('li')

  yPos = writeWrappedBlocks(lis, padding, yPos, doc, writeFootnoteNode)

  notes.remove()

  return yPos
}

function writeFootnoteNode(
  el: PdfNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  const node = $(el)
  if (node.is('a')) {
    setDocStyle(node, doc)
    return addText(node.text() + ' ', xPos, yPos, doc)
  }
  if (node.is('span.Transliteration__NoteLine')) {
    return writeNoteLine(node, doc, xPos, yPos)
  }
  if (node.is('sup')) {
    setDocStyle(node, doc)
    const text = node.text()
    return addText(text, xPos, yPos - getTextHeight(doc, text) / 2, doc)
  }
  return 0
}

function writeNoteLine(
  noteLine: JQuery<PdfNode>,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  let lineEnd = xPos
  noteLine.find('span,em,sup').each((index, part) => {
    lineEnd += writeNoteLinePart(part, doc, lineEnd, yPos)
  })
  return lineEnd - xPos
}

function writeNoteLinePart(
  part: HTMLElement,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  const element = $(part)
  if (!startsWithText(element)) {
    return 0
  }
  if (element.is('span.Transliteration__Word')) {
    return writeTransliteration(part, doc, xPos, yPos)
  }
  if (element.text() === ' ') {
    return 0
  }
  setDocStyle(element, doc)
  return addText(element.text(), xPos, yPos, doc)
}
