import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { addFootnotes } from 'fragmentarium/ui/fragment/PdfExportFootnotes'
import {
  createContainer,
  createPdfDoc,
  textCalls,
} from 'fragmentarium/ui/fragment/PdfExport.testSupport'

const noteLine =
  '<span class="Transliteration__NoteLine">' +
  '<span class="Transliteration__Word">kur</span>' +
  '<span class="Transliteration__Word"><span>ra</span></span>' +
  '<em>note</em>' +
  '<span> </span>' +
  '<span><span>x</span></span>' +
  '</span>'
const longLinks = Array(12)
  .fill('<a href="#">a rather long bibliographical reference</a>')
  .join('')

let doc: jsPDF
let container: JQuery

beforeEach(() => {
  doc = createPdfDoc()
  container = createContainer()
})

it('adds note numbers, links and note lines', () => {
  const notes = $(
    `<ol><li><sup>1</sup><a href="#">link</a>${noteLine}</li></ol>`,
  )

  const yPos = addFootnotes(notes, 17, container, 20, doc)

  expect(yPos).toBeCloseTo(25.6)
  expect(textCalls(doc)).toEqual([
    '1',
    'link ',
    'k',
    'u',
    'r',
    'ra',
    'note',
    'x',
  ])
  expect(container.children()).toHaveLength(0)
})

it('wraps long notes onto new pages', () => {
  const notes = $(`<ol><li>${longLinks}</li><li>${longLinks}</li></ol>`)

  const yPos = addFootnotes(notes, 17, container, 280, doc)

  expect(doc.addPage).toHaveBeenCalled()
  expect(yPos).toBeLessThan(287)
})
