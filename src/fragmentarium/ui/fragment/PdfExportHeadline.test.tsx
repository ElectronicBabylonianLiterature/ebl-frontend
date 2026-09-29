import React from 'react'
import { addPdfHeadLine } from 'fragmentarium/ui/fragment/PdfExportHeadline'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  createPdfDoc,
  textCalls,
} from 'fragmentarium/ui/fragment/PdfExport.testSupport'

jest.mock('fragmentarium/ui/info/Record', () => ({
  __esModule: true,
  default: () => (
    <ol>
      <li className="Record__entry">First entry</li>
      <li className="Record__entry">Second entry</li>
    </ol>
  ),
}))

it('adds number, link and credits', () => {
  const doc = createPdfDoc()
  const fragment = fragmentFactory.build({ number: 'X.1' })

  const yPos = addPdfHeadLine(doc, fragment, 15)

  expect(yPos).toBeGreaterThan(26)
  expect(textCalls(doc)).toEqual([
    'X.1',
    'https://www.ebl.lmu.de/library/X.1',
    'Credit: electronic Babylonian Library Project; First entry, Second entry',
  ])
})

it('adds a page when the credits reach the bottom of the page', () => {
  const doc = createPdfDoc()

  addPdfHeadLine(doc, fragmentFactory.build(), 280)

  expect(doc.addPage).toHaveBeenCalledTimes(1)
})
