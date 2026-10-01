import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import { getLineTypeByHtml } from 'common/utils/HtmlLineType'
import {
  checkIfNewPage,
  getLineHeight,
  getTextHeight,
  getTransliterationText,
  moveOneRowDown,
  setDocStyle,
} from 'fragmentarium/ui/fragment/PdfExport.layout'
import {
  LinePosition,
  addLines,
  getCellEndpos,
  getColumnSizes,
  getFirstColumnSize,
} from 'fragmentarium/ui/fragment/PdfExport.columns'
import { addFootnotes } from 'fragmentarium/ui/fragment/PdfExport.footnotes'

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

  const outerPaddingForTable = 17
  const firstColumnMinWidth = getFirstColumnSize(tablelines, doc)
  const firstColumnSize = outerPaddingForTable + firstColumnMinWidth

  let maxRowOffset = 0
  const linePositions: Record<string, LinePosition> = {}
  let maxXPos = 0
  const columnSizes = getColumnSizes(
    table,
    jQueryRef,
    outerPaddingForTable,
    firstColumnMinWidth,
    doc,
  )

  let xPos = 0

  tablelines.each((i, el) => {
    const lineType = getLineTypeByHtml($(el))
    const nextElement = $(el).next()
    const nextLineType = getLineTypeByHtml(nextElement)

    if (lineType === 'emptyLine') return

    if (xPos > maxRowOffset) {
      maxRowOffset = xPos
    }

    const originalYPos = {
      coords: yPos,
      page: doc.getCurrentPageInfo().pageNumber,
    }
    const maxYPos = {
      coords: yPos,
      page: doc.getCurrentPageInfo().pageNumber,
    }
    let newPageStarted = false
    let lastElement = false

    $(el)
      .find('td')
      .each((i, el) => {
        const columnDefs = columnSizes[i]
        xPos = columnDefs['startpos']
        const tdIdx = i

        if ($(el).next().length === 0 || $(el).next().next().length === 0)
          lastElement = true

        const colspan: string | undefined = $(el).is('[colspan]')
          ? $(el).attr('colspan')
          : '1'
        const colspanInt: number = colspan ? parseInt(colspan) : 1

        setDocStyle($(el), doc)

        if (lineType === 'textLine') {
          $(el)
            .find('span,em,sup')
            .each((i, el) => {
              if (
                $(el).contents().text().length > 0 &&
                $(el).contents()[0].nodeType === 3
              ) {
                if (i === 0 && $(el).text() === ' ') return

                const test =
                  xPos + getTransliterationText(el, doc, xPos, yPos, false)

                const cellEndpos = getCellEndpos(
                  columnSizes,
                  tdIdx,
                  columnDefs['endpos'],
                  colspanInt,
                )

                if (test >= cellEndpos && !columnDefs['firstElement']) {
                  yPos = moveOneRowDown(yPos, doc)

                  if (!newPageStarted) {
                    if (checkIfNewPage(yPos, doc)) {
                      newPageStarted = true
                      doc.addPage()
                      yPos = 15
                      maxYPos.coords = 15
                      maxYPos.page = doc.getCurrentPageInfo().pageNumber
                    }
                  }

                  xPos = columnDefs['startpos']
                  if (yPos > maxYPos.coords && !newPageStarted)
                    maxYPos.coords = yPos
                }
                xPos += getTransliterationText(el, doc, xPos, yPos, true)
                if (xPos > maxXPos) maxXPos = xPos
              }
            })
        } else if (lineType === 'rulingDollarLine') {
          const num = $(el)
            .parent()
            .find('.Transliteration__RulingDollarLine')
            .children('div').length
          linePositions[yPos] = {
            page: doc.getCurrentPageInfo().pageNumber,
            num: num,
          }
        } else {
          doc.text($(el).text(), xPos, yPos)
        }

        if (isNoteCell($(el))) {
          const noteNumber = $(el).text()
          doc.setFontSize(7)
          doc.text(
            noteNumber,
            doc.internal.pageSize.width - outerPaddingForTable,
            originalYPos.coords - getTextHeight(doc, noteNumber) / 2,
          )
          doc.setFontSize(10)
        }

        if (!lastElement) {
          yPos = originalYPos.coords
          if (doc.getCurrentPageInfo().pageNumber !== originalYPos.page)
            doc.setPage(originalYPos.page)
        } else {
          yPos = maxYPos.coords
          if (newPageStarted) doc.setPage(maxYPos.page)
        }
      })

    if (nextLineType === 'rulingDollarLine') {
      yPos += getLineHeight(doc) / 2
    } else {
      yPos = moveOneRowDown(yPos, doc)

      if (checkIfNewPage(yPos, doc)) {
        doc.addPage()
        yPos = 15
      }
    }
  })

  table.remove()

  const savedPage = doc.getCurrentPageInfo().pageNumber
  addLines(linePositions, maxXPos, firstColumnSize, doc)
  doc.setPage(savedPage)

  yPos = addFootnotes(notes, outerPaddingForTable, jQueryRef, yPos, doc)

  return yPos
}

function isNoteCell(element: JQuery): boolean {
  return element.find('.Transliteration__NoteLink').length > 0 ? true : false
}
