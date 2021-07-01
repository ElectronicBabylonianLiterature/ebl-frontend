import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, act, RenderResult } from '@testing-library/react'
import { Promise } from 'bluebird'

import { submitFormByTestId, clickNth } from 'test-support/utils'
import SessionContext from 'auth/SessionContext'
import CuneiformFragment from './CuneiformFragment'
import Lemmatization from 'transliteration/domain/Lemmatization'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import {
  folioPagerFactory,
  fragmentFactory,
} from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('auth/Session')

let fragment: Fragment
let element: RenderResult
let container: HTMLElement
let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let wordService: jest.Mocked<WordService>
let session: jest.Mocked<Session>
let updatedFragment: Fragment

beforeEach(async () => {
  const folioPager = folioPagerFactory.build()
  const references = referenceFactory.buildList(2)
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  fragment = fragmentFactory
    .build({
      atf: '1. ku',
      hasPhoto: true,
      collection: 'Sippar',
    })
    .setReferences(referenceFactory.buildList(2))
  updatedFragment = fragmentFactory
    .build({
      number: fragment.number,
      atf: fragment.atf,
    })
    .setReferences(references)
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentService.createLemmatization.mockImplementation((text) =>
    Promise.resolve(new Lemmatization([], []))
  )
  fragmentService.fetchCdliInfo.mockImplementation(() =>
    Promise.resolve({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    })
  )
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()

  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  session.isAllowedToLemmatizeFragments.mockReturnValue(false)
  session.hasBetaAccess.mockReturnValue(false)
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
