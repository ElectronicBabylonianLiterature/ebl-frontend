import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { renderToString } from 'react-dom/server'
import { Fragment } from 'fragmentarium/domain/fragment'
import Record from 'fragmentarium/ui/info/Record'
import {
  centerText,
  checkIfNewPage,
  getLineHeight,
} from 'fragmentarium/ui/fragment/PdfExportText'

export function addPdfHeadLine(
  doc: jsPDF,
  fragment: Fragment,
  yPos: number,
): number {
  const headlineParts = getPdfHeadline(fragment)
  const outerPaddingForCredits = 20

  doc.setFont('JunicodeBold', 'normal')
  doc.setFontSize(16)
  doc.text(headlineParts[0], centerText(doc, headlineParts[0]), yPos)

  doc.setFont('Junicode', 'normal')
  doc.setFontSize(11)
  doc.setTextColor('#007bff')

  yPos += 5.5
  doc.text(headlineParts[2], centerText(doc, headlineParts[2]), yPos)

  doc.setTextColor('black')
  doc.setFontSize(8)
  yPos += 5.5

  const currentLineHeight = getLineHeight(doc)
  const creditsSplit = doc.splitTextToSize(
    headlineParts[1],
    doc.internal.pageSize.width - outerPaddingForCredits,
  )

  for (const key in creditsSplit) {
    doc.text(creditsSplit[key], centerText(doc, creditsSplit[key]), yPos)
    yPos += currentLineHeight
    if (checkIfNewPage(yPos, doc)) {
      doc.addPage()
    }
  }

  return yPos
}

function getPdfHeadline(fragment: Fragment): [string, string, string] {
  const records: JQuery = $(
    renderToString(Record({ record: fragment.uniqueRecord })),
  )
  const credit = getCredit(records)
  const link = getHyperLink(fragment)

  return [fragment.number, credit, link]
}

function getHyperLink(fragment: Fragment): string {
  return 'https://www.ebl.lmu.de/library/' + fragment.number
}

function getCredit(records: JQuery): string {
  return (
    'Credit: electronic Babylonian Library Project; ' +
    records
      .find('.Record__entry')
      .map((i, el) => $(el).text() + ', ')
      .get()
      .join('')
      .slice(0, -2)
  )
}
