import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement, act } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'

import { submitFormByTestId, clickNth } from 'test-helpers/utils'
import SessionContext from 'auth/SessionContext'
import CuneiformFragment from './CuneiformFragment'
import Lemmatization from 'fragmentarium/domain/Lemmatization'

let fragment
let element
let container
let fragmentService
let fragmentSearchService
let session
let onChange
let updatedFragment
let expectedFragment

beforeEach(async () => {
  const folioPager = await factory.build('folioPager')
  const references = await factory.buildMany('reference', 2)
  fragment = (await factory.build('fragment', {
    atf: '1. ku',
    hasPhoto: true
  })).setReferences(await factory.buildMany('reference', 2))
  updatedFragment = await factory.build('fragment', {
    number: fragment.number,
    atf: fragment.atf
  })
  expectedFragment = updatedFragment.setReferences(references)

  onChange = jest.fn()
  fragmentService = {
    updateTransliteration: jest.fn(),
    updateReferences: jest.fn(),
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    folioPager: jest.fn(),
    createLemmatization: text => Promise.resolve(new Lemmatization([], [])),
    hydrateReferences: () => Promise.resolve(references),
    fetchCdliInfo: () => Promise.resolve({ photoUrl: null })
  }
  fragmentSearchService = {}
  session = {
    isAllowedToTransliterateFragments: () => true,
    isAllowedToLemmatizeFragments: () => false,
    hasBetaAccess: () => false
  }
  URL.createObjectURL.mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))

  act(() => {
    element = render(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <CuneiformFragment
            fragment={fragment}
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            onChange={onChange}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    )
  })
  container = element.container
  await waitForElement(() => element.getAllByText('Photo'))
})

const properties = ['collection', 'cdliNumber', 'accession']

for (let property of properties) {
  it(`Renders ${property}`, () => {
    expect(container).toHaveTextContent(fragment[property])
  })
}

it(`Renders museum`, () => {
  expect(container).toHaveTextContent(fragment.museum.name)
})

it('Renders all joins', () => {
  for (let item of fragment.joins) {
    expect(container).toHaveTextContent(item)
  }
})

it('Renders all measures', () => {
  for (let property of ['length', 'width', 'thickness']) {
    expect(container).toHaveTextContent(fragment.measures[property])
  }
})

it('Renders all references', () => {
  for (let reference of fragment.references) {
    expect(container).toHaveTextContent(reference.primaryAuthor)
  }
})

it('Renders all records', () => {
  for (let uniqueRecord of fragment.uniqueRecord) {
    expect(container).toHaveTextContent(uniqueRecord.user)
  }
})

it('Renders all folios', () => {
  for (let folio of fragment.folios) {
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

  await waitForElement(() => element.getAllByText(expectedFragment.cdliNumber))
})

it('Updates view on References save', async () => {
  fragmentService.updateReferences.mockReturnValueOnce(
    Promise.resolve(updatedFragment)
  )
  clickNth(element, 'References', 0)
  await waitForElement(() => element.getAllByText('Document'))
  submitFormByTestId(element, 'references-form')

  await waitForElement(() => element.getByText(expectedFragment.cdliNumber))
})
