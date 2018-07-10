import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import { clickNth } from 'testHelpers'
import CuneiformFragment from './CuneiformFragment'

let fragment
let element
let container
let apiClient
let onChange

afterEach(cleanup)

beforeEach(async () => {
  onChange = jest.fn()
  apiClient = new ApiClient(new Auth())
  fragment = await factory.build('fragment')
  element = render(<CuneiformFragment
    fragment={fragment}
    apiClient={apiClient}
    onChange={onChange}
  />)
  container = element.container
})

const properties = [
  '_id', 'museum', 'collection', 'cdliNumber', 'accession', 'description', 'publication'
]

for (let property of properties) {
  it(`Renders ${property}`, () => {
    expect(container).toHaveTextContent(fragment[property])
  })
}

it('Renders transliteration form', () => {
  expect(element.getByLabelText('Transliteration').value).toEqual(fragment.transliteration)
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
  for (let folio of fragment.folio) {
    expect(container).toHaveTextContent(folio.number)
  }
})

it('Calls onChange on save', async () => {
  jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve())

  await clickNth(element, 'Save', 0)

  expect(onChange).toHaveBeenCalled()
})
