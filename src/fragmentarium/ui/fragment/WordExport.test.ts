import $ from 'jquery'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-support/complexTestText'
import WordService from 'dictionary/application/WordService'
import { wordDto } from 'test-support/test-word'
import { wordExport } from './WordExport'
import Bluebird from 'bluebird'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Document } from 'docx'

jest.mock('dictionary/application/WordService')

let wordService: jest.Mocked<WordService>
let fragment: Fragment
let wordBlob: Document

beforeEach(async () => {
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  wordService.find.mockReturnValue(Bluebird.resolve(wordDto))

  fragment = fragmentFactory.build(
    {
      publication: 'Guod cigipli epibif odepuwu.',
      description:
        'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
    },
    { associations: { text: complexText } }
  )

  wordBlob = await wordExport(fragment, wordService, $('#jQueryContainer'))
})

test('outputType', () => {
  expect(wordBlob).toBeInstanceOf(Document)
})
