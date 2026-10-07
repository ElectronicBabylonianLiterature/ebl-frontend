import { jsPDF } from 'jspdf'
import { Fragment } from 'fragmentarium/domain/fragment'
import { CANONICAL_ORIGIN } from 'router/domain'
import {
  centerText,
  checkIfNewPage,
  getLineHeight,
} from 'fragmentarium/ui/fragment/PdfExport.layout'
import recordCredit from 'fragmentarium/ui/info/recordCredit'

const outerPaddingForCredits = 20

export function addPdfHeadLine(
  doc: jsPDF,
  fragment: Fragment,
  yPos: number,
): number {
  const headlineParts = getPdfHeadline(fragment)

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

  const lineHeight = getLineHeight(doc)
  const creditLines: string[] = doc.splitTextToSize(
    headlineParts[1],
    doc.internal.pageSize.width - outerPaddingForCredits,
  )
  creditLines.forEach((creditLine) => {
    doc.text(creditLine, centerText(doc, creditLine), yPos)
    yPos += lineHeight
    if (checkIfNewPage(yPos, doc)) {
      doc.addPage()
    }
  })

  return yPos
}

function getPdfHeadline(fragment: Fragment): [string, string, string] {
  return [
    fragment.number,
    recordCredit(fragment.uniqueRecord),
    getHyperLink(fragment),
  ]
}

function getHyperLink(fragment: Fragment): string {
  return `${CANONICAL_ORIGIN}/library/${fragment.number}`
}
