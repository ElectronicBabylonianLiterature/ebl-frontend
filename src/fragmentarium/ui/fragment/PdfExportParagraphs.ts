import $ from 'jquery'
import { jsPDF } from 'jspdf'
import {
  PdfHtmlNode,
  startNewPageIfNeeded,
} from 'fragmentarium/ui/fragment/PdfExportText'

const paragraphLineHeight = 5.6

export type PdfNodeRenderer = (
  el: PdfHtmlNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
) => number

export function addWrappedParagraphs(
  paragraphs: JQuery,
  padding: number,
  yPos: number,
  doc: jsPDF,
  renderNode: PdfNodeRenderer,
): number {
  paragraphs.each((i, el) => {
    let linePos = padding

    $(el)
      .contents()
      .each((i, el) => {
        if (linePos > doc.internal.pageSize.width - padding) {
          linePos = padding
          yPos = startNewPageIfNeeded(yPos + paragraphLineHeight, doc)
        }
        linePos += renderNode(el, doc, linePos, yPos)
      })
    yPos = startNewPageIfNeeded(yPos + paragraphLineHeight, doc)
  })

  return yPos
}
