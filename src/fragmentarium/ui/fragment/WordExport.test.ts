import $ from 'jquery'
import { Fragment } from 'fragmentarium/domain/fragment'
import complexText from 'test-support/complexTestText'
import WordService from 'dictionary/application/WordService'
import { wordExport } from './WordExport'
import Bluebird from 'bluebird'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Document } from 'docx'
import { createDictionaryWord } from 'test-support/glossary'
import type { ReactNode } from 'react'

jest.mock('dictionary/application/WordService')
jest.mock('react-bootstrap', () => {
  const actual = jest.requireActual('react-bootstrap')
  return {
    ...actual,
    OverlayTrigger: ({ children }: { children: ReactNode }) => children,
  }
})
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    MemoryRouter: ({ children }: { children: ReactNode }) => children,
    Link: ({ children }: { children: ReactNode }) => children,
  }
})

let wordService: jest.Mocked<WordService>
let fragment: Fragment
let wordBlob: Document

beforeEach(async () => {
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  jest.spyOn(wordService, 'findAll').mockImplementation((ids) => {
    const words = [...new Set(ids)].map((id) => createDictionaryWord(id))
    return Bluebird.resolve(words)
  })

  fragment = fragmentFactory.build(
    {
      publication: 'Guod cigipli epibif odepuwu.',
      description:
        'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.',
    },
    { associations: { text: complexText } },
  )

  wordBlob = await wordExport(fragment, wordService, $('#jQueryContainer'))
})

test('outputType', () => {
  expect(wordBlob).toBeInstanceOf(Document)
})
