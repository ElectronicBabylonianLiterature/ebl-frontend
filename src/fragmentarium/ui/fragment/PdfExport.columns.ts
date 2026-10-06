import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { getTextWidth } from 'fragmentarium/ui/fragment/PdfExport.layout'

export interface ColumnSize {
  startpos: number
  width: number
  endpos: number
  firstElement: boolean
}

export interface LinePosition {
  num: number
  page: number
}

export function getFirstColumnSize(tablelines: JQuery, doc: jsPDF): number {
  let maxCharsInFirstTd = 0
  let longestFirstTd = ''
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
  columnSizes: Record<number, ColumnSize>,
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
): Record<number, ColumnSize> {
  const columnSizes: Record<number, ColumnSize> = {}

  setJQueryRefTo1000Px(jQueryRef)

  let maxChild = 0
  let firstRowWithMaxChildren: JQuery = $()

  table.find('tr').each((i, el) => {
    if ($(el).children('td').length > maxChild) {
      maxChild = $(el).children('td').length
      firstRowWithMaxChildren = $(el)
    }
  })

  let startpos = outerPaddingForTable

  firstRowWithMaxChildren.find('td').each((i, el) => {
    const outerWidth = $(el).outerWidth()
    const tableWidth = table.find('tbody').outerWidth()
    let percentage = 1
    if (outerWidth && tableWidth) percentage = outerWidth / tableWidth
    let docWidth = doc.internal.pageSize.width - outerPaddingForTable * 2

    if (i === 0) {
      docWidth = firstColumnMinWidth
      percentage = 1
    }

    columnSizes[i] = {
      startpos: startpos,
      width: docWidth * percentage,
      endpos: startpos + docWidth * percentage,
      firstElement: i === 0 ? true : false,
    }
    startpos += docWidth * percentage
  })

  unSetJQueryRef1000Px(jQueryRef)

  return columnSizes
}

function setJQueryRefTo1000Px(jQueryRef: JQuery) {
  jQueryRef.css('position', 'absolute')
  jQueryRef.css('width', '1000px')
}

function unSetJQueryRef1000Px(jQueryRef: JQuery) {
  jQueryRef.css('position', '')
  jQueryRef.css('width', '')
}

interface RulingSpan {
  startXPos: number
  endXPos: number
}

const rulingLineStep = 1

export function addLines(
  linePositions: Record<string, LinePosition>,
  maxXPos: number,
  endposFirstColumn: number,
  doc: jsPDF,
): void {
  const span = { startXPos: endposFirstColumn, endXPos: maxXPos }
  Object.entries(linePositions).forEach(([yPos, linePosition]) => {
    doc.setPage(linePosition.page)
    addRuling(Number(yPos), linePosition.num, span, doc)
  })
}

function rulingLineCount(num: number): number {
  return num === 2 || num === 3 ? num : 1
}

function addRuling(
  yPos: number,
  num: number,
  span: RulingSpan,
  doc: jsPDF,
): void {
  for (let line = 0; line < rulingLineCount(num); line++) {
    const lineYPos = yPos + rulingLineStep * line
    doc.line(span.startXPos, lineYPos, span.endXPos, lineYPos)
  }
}
