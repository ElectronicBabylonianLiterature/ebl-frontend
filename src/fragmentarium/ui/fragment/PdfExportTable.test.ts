import $ from 'jquery'
import { addMainTableWithFootnotes } from 'fragmentarium/ui/fragment/PdfExportTable'
import {
  createContainer,
  createPdfDoc,
  textCalls,
} from 'fragmentarium/ui/fragment/PdfExport.testSupport'

const words = Array(100).fill('<span>lorem </span>').join('')
const textRow = (number: number): string =>
  `<tr><td class="Transliteration__TextLine"><span>${number}.</span></td>` +
  `<td><span> </span>${words}<em>ipsum</em></td>` +
  '<td><span>x</span></td>' +
  '<td><a class="Transliteration__NoteLink">1</a></td></tr>'
const rulingRow = (count: number): string =>
  '<tr><td colspan="4"><div class="Transliteration__ruling"></div>' +
  `<div class="Transliteration__RulingDollarLine">${'<div></div>'.repeat(
    count,
  )}</div>ruling</td></tr>`
const rows = [
  textRow(1),
  rulingRow(1),
  textRow(2),
  rulingRow(2),
  textRow(3),
  rulingRow(3),
  '<tr><td></td></tr>',
  '<tr><td>$ single ruling</td></tr>',
  ...Array.from({ length: 30 }, (_, index) => textRow(index + 4)),
]

it('adds text lines, rulings and note numbers across pages', () => {
  const doc = createPdfDoc()
  const table = $(`<table><tbody>${rows.join('')}</tbody></table>`)
  const container = createContainer()

  const yPos = addMainTableWithFootnotes(
    table,
    $('<ol></ol>'),
    container,
    30,
    doc,
  )

  expect(yPos).toBeLessThan(287)
  expect(doc.getNumberOfPages()).toBeGreaterThan(1)
  expect(doc.line).toHaveBeenCalledTimes(6)
  const text = textCalls(doc).join('')
  expect(text).toContain('1.lorem lorem')
  expect(text).toContain('ipsumx1')
  expect(text).toContain('$ single ruling')
  expect(text.split('ruling')).toHaveLength(2)
  expect(container.children()).toHaveLength(0)
})
