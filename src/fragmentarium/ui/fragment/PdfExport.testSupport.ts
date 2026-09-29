import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { addCustomFonts } from 'fragmentarium/ui/fragment/PdfExportFonts'

export function createPdfDoc(): jsPDF {
  const doc = new jsPDF()
  addCustomFonts(doc)
  jest.spyOn(doc, 'setFont')
  jest.spyOn(doc, 'setFontSize')
  jest.spyOn(doc, 'setTextColor')
  jest.spyOn(doc, 'text')
  jest.spyOn(doc, 'line')
  jest.spyOn(doc, 'addPage')
  return doc
}

export function createContainer(): JQuery {
  return $('<div></div>').appendTo('body')
}

export function textCalls(doc: jsPDF): string[] {
  return (doc.text as jest.Mock).mock.calls.map(([text]) => text)
}
