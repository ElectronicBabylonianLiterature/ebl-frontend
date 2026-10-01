import { jsPDF } from 'jspdf'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import recordCredit from 'fragmentarium/ui/info/recordCredit'
import { addPdfHeadLine } from 'fragmentarium/ui/fragment/PdfExport.headline'
import { addCustomFonts } from 'fragmentarium/ui/fragment/PdfExport'
import { fragmentFactory } from 'test-support/fragment-fixtures'

const transliteration = new RecordEntry({
  user: 'Geller',
  date: '2019-06-20T13:40:21.000Z',
  type: 'Transliteration',
})
const revision = new RecordEntry({
  user: 'Jiménez',
  date: '2020-02-01T09:00:00.000Z',
  type: 'Revision',
})

it('lists every record entry after the project credit', () => {
  expect(recordCredit([transliteration, revision])).toEqual(
    'Credit: electronic Babylonian Library Project; Geller (Transliteration, 20/6/2019), Jiménez (Revision, 1/2/2020)',
  )
})

it('credits "No record" when the fragment has no record', () => {
  expect(recordCredit([])).toEqual(
    'Credit: electronic Babylonian Library Project; No record',
  )
})

it('prints the record credit in the PDF headline', () => {
  const doc = new jsPDF()
  addCustomFonts(doc)
  const text = jest.spyOn(doc, 'text')

  addPdfHeadLine(
    doc,
    fragmentFactory.build({}, { associations: { record: [transliteration] } }),
    20,
  )

  expect(text).toHaveBeenCalledWith(
    'Credit: electronic Babylonian Library Project; Geller (Transliteration, 20/6/2019)',
    expect.any(Number),
    expect.any(Number),
  )
})

it('continues a long credit on a new page', () => {
  const doc = new jsPDF({ format: [60, 40] })
  addCustomFonts(doc)
  const record = Array.from(
    { length: 40 },
    (_unused, index) =>
      new RecordEntry({
        user: `Editor ${index}`,
        date: `2020-01-${String((index % 28) + 1).padStart(2, '0')}T0${
          index % 10
        }:00:00.000Z`,
        type: 'Revision',
      }),
  )

  addPdfHeadLine(
    doc,
    fragmentFactory.build({}, { associations: { record } }),
    20,
  )

  expect(doc.getNumberOfPages()).toBeGreaterThan(1)
})
