import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, cleanup } from 'react-testing-library'
import { factory } from 'factory-girl'

import { submitForm } from 'testHelpers'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import CuneiformFragment from './CuneiformFragment'

let fragment
let element
let container
let apiClient
let onChange

afterEach(cleanup)

beforeEach(async () => {
  const auth = new Auth()
  jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
  onChange = jest.fn()
  apiClient = new ApiClient(auth)
  URL.createObjectURL.mockReturnValue('url')
  jest.spyOn(apiClient, 'fetchBlob').mockReturnValue(Promise.resolve(new Blob([''], {type: 'image/jpeg'})))
  fragment = await factory.build('fragment')
  element = render(
    <MemoryRouter>
      <CuneiformFragment
        fragment={fragment}
        apiClient={apiClient}
        auth={auth}
        onChange={onChange} />
    </MemoryRouter>)
  container = element.container
})

const properties = [
  'museum', 'collection', 'cdliNumber', 'accession', 'description', 'publication'
]

for (let property of properties) {
  it(`Renders ${property}`, () => {
    expect(container).toHaveTextContent(fragment[property])
  })
}

it('Renders transliteration field', () => {
  expect(element.getByLabelText('Transliteration').value).toEqual(fragment.transliteration)
})

it('Renders notes field', () => {
  expect(element.getByLabelText('Notes').value).toEqual(fragment.notes)
})

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
  jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve())

  await submitForm(element, '#transliteration-form')

  expect(onChange).toHaveBeenCalled()
})
