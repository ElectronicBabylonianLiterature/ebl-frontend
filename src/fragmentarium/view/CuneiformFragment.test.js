import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'

import { submitForm } from 'testHelpers'
import SessionContext from 'auth/SessionContext'
import CuneiformFragment from './CuneiformFragment'
import Lemmatization from 'fragmentarium/lemmatization/Lemmatization'

let fragment
let element
let container
let fragmentService
let session
let onChange

beforeEach(async () => {
  const folioPager = await factory.build('folioPager')
  onChange = jest.fn()
  fragmentService = {
    updateTransliteration: jest.fn(),
    findFolio: jest.fn(),
    folioPager: jest.fn(),
    createLemmatization: text => Promise.resolve(new Lemmatization([], [])),
    findBibliography: id => Promise.resolve(null)
  }
  session = {
    isAllowedToTransliterateFragments: () => true,
    isAllowedToLemmatizeFragments: () => false,
    hasBetaAccess: () => false
  }
  URL.createObjectURL.mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
  fragment = await factory.build('fragment', { atf: '1. ku' })
  element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <CuneiformFragment
          fragment={fragment}
          fragmentService={fragmentService}
          onChange={onChange} />
      </SessionContext.Provider>
    </MemoryRouter>)
  container = element.container
})

const properties = [
  'museum', 'collection', 'cdliNumber', 'accession'
]

for (let property of properties) {
  it(`Renders ${property}`, () => {
    expect(container).toHaveTextContent(fragment[property])
  })
}

it('Renders all joins', () => {
  for (let item of fragment.joins) {
    expect(container).toHaveTextContent(item)
  }
})

it('Renders all measures', () => {
  for (let property of ['length', 'width', 'thickness']) {
    expect(container).toHaveTextContent(fragment[property].value)
  }
})

it('Renders all records', () => {
  for (let record of fragment.record) {
    expect(container).toHaveTextContent(record.user)
  }
})

it('Renders all folios', () => {
  for (let folio of fragment.folios) {
    expect(container).toHaveTextContent(folio.number)
  }
})

it('Links museum record', () => {
  expect(element.getByLabelText(`The British Museum object ${fragment.bmIdNumber}`))
    .toHaveAttribute('href', `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${fragment.bmIdNumber}&partId=1`)
})

it('Calls onChange on save', async () => {
  fragmentService.updateTransliteration.mockReturnValueOnce(Promise.resolve())

  await submitForm(element, '#transliteration-form')

  expect(onChange).toHaveBeenCalled()
})
