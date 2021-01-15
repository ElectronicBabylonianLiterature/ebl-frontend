import { act } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-support/complexTestText'
import WordService from 'dictionary/application/WordService'
import Display from './Display'
import { wordDto } from 'test-support/test-word'
import { wordExport } from './WordExport'

jest.mock('dictionary/application/WordService')

let wordService
let fragment: Fragment
let wordBlob: Promise<Blob>

beforeEach(async () => {
  wordService = new WordService(null)
  jest
    .spyOn(wordService, 'find')
    .mockImplementation(() => Promise.resolve(wordDto))
  fragment = await factory.build('fragment', {
    publication: 'Guod cigipli epibif odepuwu.',
    text: complexText,
    description:
      'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
  })

  wordBlob = await wordExport(fragment, wordService).then((blob) => {
    return blob
  })
})

test('outputType', () => {
  expect(typeof wordBlob).toBe('object')
})
