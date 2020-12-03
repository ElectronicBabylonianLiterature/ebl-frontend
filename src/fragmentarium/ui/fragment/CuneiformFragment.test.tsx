import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, act } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'

import { submitFormByTestId, clickNth } from 'test-support/utils'
import SessionContext from 'auth/SessionContext'
import CuneiformFragment from './CuneiformFragment'
import Lemmatization from 'transliteration/domain/Lemmatization'
import WordService from 'dictionary/application/WordService'

jest.mock('dictionary/application/WordService')

let fragment
let element
let container
let fragmentService
let fragmentSearchService
let wordService
let session
let updatedFragment

beforeEach(async () => {
  const folioPager = await factory.build('folioPager')
  const references = await factory.buildMany('reference', 2)
  wordService = new WordService(null)
  fragment = (
    await factory.build('fragment', {
      atf: '1. ku',
      hasPhoto: true,
      collection: 'Sippar',
    })
  ).setReferences(await factory.buildMany('reference', 2))
  updatedFragment = (
    await factory.build('fragment', {
      number: fragment.number,
      atf: fragment.atf,
    })
  ).setReferences(references)

  fragmentService = {
    updateTransliteration: jest.fn(),
    updateReferences: jest.fn(),
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    fetchGenres: jest.fn(),
    updateGenres: jest.fn(),
    folioPager: jest.fn(),
    createLemmatization: (text) => Promise.resolve(new Lemmatization([], [])),
    fetchCdliInfo: () => Promise.resolve({ photoUrl: null }),
  }
  fragmentSearchService = {}
  session = {
    isAllowedToTransliterateFragments: () => true,
    isAllowedToLemmatizeFragments: () => false,
    hasBetaAccess: () => false,
  }
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))

  fragmentService.fetchGenres.mockReturnValue(
    Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']])
  )
  fragmentService.updateGenres.mockReturnValue(Promise.resolve(fragment))

  await act(async () => {
    element = render(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <CuneiformFragment
            fragment={fragment}
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            wordService={wordService}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    )
  })
  container = element.container
  await element.findAllByText('Photo')
})

test.each(['collection', 'cdliNumber', 'accession'])(
  'Renders %s',
  (property) => {
    expect(container).toHaveTextContent(fragment[property])
  }
)

it(`Renders museum`, () => {
  expect(container).toHaveTextContent(fragment.museum.name)
})

it('Renders all joins', () => {
  for (const item of fragment.joins) {
    expect(container).toHaveTextContent(item)
  }
})

it('Renders all measures', () => {
  for (const property of ['length', 'width', 'thickness']) {
    expect(container).toHaveTextContent(fragment.measures[property])
  }
})

it('Renders all references', () => {
  for (const reference of fragment.references) {
    expect(container).toHaveTextContent(reference.primaryAuthor)
  }
})

it('Renders all records', () => {
  for (const uniqueRecord of fragment.uniqueRecord) {
    expect(container).toHaveTextContent(uniqueRecord.user)
  }
})

it('Renders all folios', () => {
  for (const folio of fragment.folios) {
    expect(container).toHaveTextContent(folio.number)
  }
})

it('Links museum record', () => {
  expect(
    element.getByLabelText(`The British Museum object ${fragment.bmIdNumber}`)
  ).toHaveAttribute(
    'href',
    `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${fragment.bmIdNumber}&partId=1`
  )
})

it('Updates view on Edition save', async () => {
  fragmentService.updateTransliteration.mockReturnValueOnce(
    Promise.resolve(updatedFragment)
  )

  submitFormByTestId(element, 'transliteration-form')

  await element.findAllByText(updatedFragment.cdliNumber)
})

it('Updates view on References save', async () => {
  fragmentService.updateReferences.mockReturnValueOnce(
    Promise.resolve(updatedFragment)
  )
  clickNth(element, 'References', 1)
  await element.findAllByText('Document')
  submitFormByTestId(element, 'references-form')

  await element.findByText(updatedFragment.cdliNumber)
})
