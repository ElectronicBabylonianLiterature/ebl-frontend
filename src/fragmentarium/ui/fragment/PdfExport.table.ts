import { jsPDF } from 'jspdf'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import {
  addLines,
  getColumnSizes,
  getFirstColumnSize,
} from 'fragmentarium/ui/fragment/PdfExport.columns'
import { addFootnotes } from 'fragmentarium/ui/fragment/PdfExport.footnotes'
import {
  TableLayout,
  writeTableRow,
} from 'fragmentarium/ui/fragment/PdfExport.tableRow'

const outerPaddingForTable = 17

export function addMainTableWithFootnotes(
  table: JQuery,
  notes: JQuery,
  jQueryRef: JQuery,
  yPos: number,
  doc: jsPDF,
): number {
  jQueryRef.append(table)

  const tablelines: JQuery = table.find('tr')
  fixHtmlParseOrder(tablelines)

  doc.setFontSize(10)

  const firstColumnMinWidth = getFirstColumnSize(tablelines, doc)
  const layout: TableLayout = {
    doc,
    columnSizes: getColumnSizes(
      table,
      jQueryRef,
      outerPaddingForTable,
      firstColumnMinWidth,
      doc,
    ),
    outerPadding: outerPaddingForTable,
    linePositions: {},
    maxXPos: 0,
  }

  tablelines.each((index, row) => {
    yPos = writeTableRow(row, yPos, layout)
  })

  table.remove()

  const savedPage = doc.getCurrentPageInfo().pageNumber
  addLines(
    layout.linePositions,
    layout.maxXPos,
    outerPaddingForTable + firstColumnMinWidth,
    doc,
  )
  doc.setPage(savedPage)

  return addFootnotes(notes, outerPaddingForTable, jQueryRef, yPos, doc)
}
