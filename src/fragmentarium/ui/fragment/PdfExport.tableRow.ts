import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { getLineTypeByHtml } from 'common/utils/HtmlLineType'
import {
  checkIfNewPage,
  getLineHeight,
  getTextHeight,
  measureTransliteration,
  moveOneRowDown,
  setDocStyle,
  startsWithText,
  writeTransliteration,
} from 'fragmentarium/ui/fragment/PdfExport.layout'
import {
  ColumnSize,
  LinePosition,
  getCellEndpos,
} from 'fragmentarium/ui/fragment/PdfExport.columns'

export interface TableLayout {
  doc: jsPDF
  columnSizes: Record<number, ColumnSize>
  outerPadding: number
  linePositions: Record<string, LinePosition>
  maxXPos: number
}

interface PagePosition {
  coords: number
  page: number
}

interface RowState {
  yPos: number
  original: PagePosition
  max: PagePosition
  newPageStarted: boolean
  lastElement: boolean
}

const firstYPosOnPage = 15

function currentPosition(yPos: number, doc: jsPDF): PagePosition {
  return { coords: yPos, page: doc.getCurrentPageInfo().pageNumber }
}

export function writeTableRow(
  row: HTMLElement,
  yPos: number,
  layout: TableLayout,
): number {
  const lineType = getLineTypeByHtml($(row))
  if (lineType === 'emptyLine') {
    return yPos
  }
  const state: RowState = {
    yPos,
    original: currentPosition(yPos, layout.doc),
    max: currentPosition(yPos, layout.doc),
    newPageStarted: false,
    lastElement: false,
  }
  $(row)
    .find('td')
    .each((index, cell) => writeCell($(cell), index, lineType, state, layout))
  return advancePastRow(state.yPos, $(row).next(), layout.doc)
}

function isLastOrSecondLastCell(cell: JQuery): boolean {
  return cell.next().length === 0 || cell.next().next().length === 0
}

function writeCell(
  cell: JQuery,
  index: number,
  lineType: string,
  state: RowState,
  layout: TableLayout,
): void {
  state.lastElement = state.lastElement || isLastOrSecondLastCell(cell)
  setDocStyle(cell, layout.doc)
  if (lineType === 'textLine') {
    writeTextLineCell(cell, index, state, layout)
  } else if (lineType === 'rulingDollarLine') {
    recordRuling(cell, state.yPos, layout)
  } else {
    layout.doc.text(cell.text(), layout.columnSizes[index].startpos, state.yPos)
  }
  if (isNoteCell(cell)) {
    writeNoteNumber(cell.text(), state.original.coords, layout)
  }
  restoreRowPosition(state, layout.doc)
}

function getColspan(cell: JQuery): number {
  const colspan = cell.attr('colspan')
  return colspan ? parseInt(colspan) : 1
}

function writeTextLineCell(
  cell: JQuery,
  index: number,
  state: RowState,
  layout: TableLayout,
): void {
  const column = layout.columnSizes[index]
  const cellEndpos = getCellEndpos(
    layout.columnSizes,
    index,
    column.endpos,
    getColspan(cell),
  )
  let xPos = column.startpos
  cell.find('span,em,sup').each((elementIndex, element) => {
    if (!startsWithText($(element))) return
    if (elementIndex === 0 && $(element).text() === ' ') return
    const endXPos = xPos + measureTransliteration(element, layout.doc)
    if (endXPos >= cellEndpos && !column.firstElement) {
      wrapToNextLine(state, layout.doc)
      xPos = column.startpos
    }
    xPos += writeTransliteration(element, layout.doc, xPos, state.yPos)
    layout.maxXPos = Math.max(layout.maxXPos, xPos)
  })
}

function wrapToNextLine(state: RowState, doc: jsPDF): void {
  state.yPos = moveOneRowDown(state.yPos, doc)
  if (!state.newPageStarted && checkIfNewPage(state.yPos, doc)) {
    state.newPageStarted = true
    doc.addPage()
    state.yPos = firstYPosOnPage
    state.max = currentPosition(firstYPosOnPage, doc)
  }
  if (state.yPos > state.max.coords && !state.newPageStarted) {
    state.max.coords = state.yPos
  }
}

function recordRuling(cell: JQuery, yPos: number, layout: TableLayout): void {
  layout.linePositions[yPos] = {
    page: layout.doc.getCurrentPageInfo().pageNumber,
    num: cell
      .parent()
      .find('.Transliteration__RulingDollarLine')
      .children('div').length,
  }
}

function isNoteCell(cell: JQuery): boolean {
  return cell.find('.Transliteration__NoteLink').length > 0
}

function writeNoteNumber(
  noteNumber: string,
  yPos: number,
  layout: TableLayout,
): void {
  const { doc } = layout
  doc.setFontSize(7)
  doc.text(
    noteNumber,
    doc.internal.pageSize.width - layout.outerPadding,
    yPos - getTextHeight(doc, noteNumber) / 2,
  )
  doc.setFontSize(10)
}

function restoreRowPosition(state: RowState, doc: jsPDF): void {
  if (!state.lastElement) {
    state.yPos = state.original.coords
    if (doc.getCurrentPageInfo().pageNumber !== state.original.page) {
      doc.setPage(state.original.page)
    }
  } else {
    state.yPos = state.max.coords
    if (state.newPageStarted) doc.setPage(state.max.page)
  }
}

function advancePastRow(yPos: number, nextRow: JQuery, doc: jsPDF): number {
  if (getLineTypeByHtml(nextRow) === 'rulingDollarLine') {
    return yPos + getLineHeight(doc) / 2
  }
  const nextYPos = moveOneRowDown(yPos, doc)
  if (checkIfNewPage(nextYPos, doc)) {
    doc.addPage()
    return firstYPosOnPage
  }
  return nextYPos
}
