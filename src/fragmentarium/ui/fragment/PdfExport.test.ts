import $ from 'jquery'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-support/complexTestText'
import WordService from 'dictionary/application/WordService'
import { wordDto } from 'test-support/test-word'
import { pdfExport } from './PdfExport'
import { jsPDF } from 'jspdf'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import Promise from 'bluebird'

jest.mock('dictionary/application/WordService')

let wordService: jest.Mocked<WordService>
let fragment: Fragment
let pdfDoc: jsPDF

beforeEach(async () => {
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  jest
    .spyOn(wordService, 'find')
    .mockImplementation(() => Promise.resolve(wordDto))
  fragment = fragmentFactory.build(
    {
      publication: 'Guod cigipli epibif odepuwu.',
      description:
        'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
    },
    { associations: { text: complexText } }
  )

  pdfDoc = await pdfExport(fragment, wordService, $('#jQueryContainer')).then(
    (doc) => {
      return doc
    }
  )
})

test('outputType', () => {
  expect(typeof pdfDoc).toBe('object')
})
