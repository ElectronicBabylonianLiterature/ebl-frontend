import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { getTextWidth } from 'fragmentarium/ui/fragment/PdfExportText'

export type ColumnSizes = Record<
  number,
  { startpos: number; endpos: number; maxColWidth: number }
>

export type LinePositions = Record<string, { num: number; page: number }>

export function getFirstColumnSize(tablelines: JQuery, doc: jsPDF): number {
  let maxCharsInFirstTd = 0
  let longestFirstTd
  tablelines.each((i, el) => {
    const text = $(el).find('td').first().text()
    if (text.length > maxCharsInFirstTd) {
      maxCharsInFirstTd = text.length
      longestFirstTd = text
    }
  })

  return Math.ceil(getTextWidth(doc, longestFirstTd)) + 0.5
}

export function getCellEndpos(
  columnSizes: Record<number, { endpos: number }>,
  tdIdx: number,
  endpos: number,
  colspanInt: number,
): number {
  if (colspanInt > 1) {
    return columnSizes[tdIdx + colspanInt - 1]['endpos']
  } else {
    return endpos
  }
}

export function getColumnSizes(
  table: JQuery,
  jQueryRef: JQuery,
  outerPaddingForTable: number,
  firstColumnMinWidth: number,
  doc: jsPDF,
): ColumnSizes {
  const columnSizes = {}

  setJQueryRefTo1000Px(jQueryRef)

  let maxChild = 0
  let firstRowWithMaxChildren

  table.find('tr').each((i, el) => {
    if ($(el).children('td').length > maxChild) {
      maxChild = $(el).children('td').length
      firstRowWithMaxChildren = el
    }
  })

  let startpos = outerPaddingForTable

  $(firstRowWithMaxChildren)
    .find('td')
    .each((i, el) => {
      const outerWidth = $(el).outerWidth()
      const tableWidth = table.find('tbody').outerWidth()
      let percentage = 1
      if (outerWidth && tableWidth) percentage = outerWidth / tableWidth
      let docWidth = doc.internal.pageSize.width - outerPaddingForTable * 2

      if (i === 0) {
        docWidth = firstColumnMinWidth
        percentage = 1
      }

      columnSizes[i] = {}
      columnSizes[i]['startpos'] = startpos
      columnSizes[i]['width'] = docWidth * percentage
      columnSizes[i]['endpos'] = startpos + docWidth * percentage

      columnSizes[i]['firstElement'] = i === 0 ? true : false
      startpos += docWidth * percentage
    })

  unSetJQueryRef1000Px(jQueryRef)

  return columnSizes
}

function setJQueryRefTo1000Px(jQueryRef: JQuery): void {
  jQueryRef.css('position', 'absolute')
  jQueryRef.css('width', '1000px')
}

function unSetJQueryRef1000Px(jQueryRef: JQuery): void {
  jQueryRef.css('position', '')
  jQueryRef.css('width', '')
}

export function isNoteCell(element: JQuery): boolean {
  return element.find('.Transliteration__NoteLink').length > 0 ? true : false
}

export function addLines(
  linePositions: LinePositions,
  maxXPos: number,
  endposFirstColumn: number,
  doc: jsPDF,
): void {
  for (const yPos in linePositions) {
    addUnderLine(
      Number(yPos),
      maxXPos,
      linePositions[yPos].num,
      linePositions[yPos].page,
      endposFirstColumn,
      doc,
    )
  }
}

function addUnderLine(
  yPos: number,
  endpos: number,
  num: number,
  page: number,
  endposFirstColumn: number,
  doc: jsPDF,
): number {
  doc.setPage(page)

  const smallLineStep = 1
  const lineCount = num === 3 ? 3 : num === 2 ? 2 : 1

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineYPos = lineIndex === 0 ? yPos : yPos + smallLineStep * lineIndex
    doc.line(endposFirstColumn, lineYPos, endpos, lineYPos)
  }

  return yPos
}
