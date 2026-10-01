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

export function addLines(
  linePositions: Record<string, LinePosition>,
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
) {
  doc.setPage(page)

  const smallLineStep = 1

  if (num === 3) {
    doc.line(endposFirstColumn, yPos, endpos, yPos)
    doc.line(
      endposFirstColumn,
      yPos + smallLineStep,
      endpos,
      yPos + smallLineStep,
    )
    doc.line(
      endposFirstColumn,
      yPos + smallLineStep * 2,
      endpos,
      yPos + smallLineStep * 2,
    )
  } else if (num === 2) {
    doc.line(endposFirstColumn, yPos, endpos, yPos)
    doc.line(
      endposFirstColumn,
      yPos + smallLineStep,
      endpos,
      yPos + smallLineStep,
    )
  } else doc.line(endposFirstColumn, yPos, endpos, yPos)

  return yPos
}
