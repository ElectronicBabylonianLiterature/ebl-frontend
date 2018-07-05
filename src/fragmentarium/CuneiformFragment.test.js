import React from 'react'
import { matchPath } from 'react-router'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import CuneiformFragment from './CuneiformFragment'
import ApiClient from '../http/ApiClient'
import Auth from '../auth0/Auth'

let fragment
let apiClient
let conatiner
let element

afterEach(cleanup)

describe('fragment display', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment')
    apiClient = new ApiClient(new Auth())
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    const match = matchPath(`/fragmentarium/${fragment._id}`, {
      path: '/fragmentarium/:id'
    })
    element = render(<CuneiformFragment match={match} apiClient={apiClient} />)
    await wait()
    conatiner = element.container
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    const expectedPath = `/fragments/${fragment._id}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath)
  })

  const properties = [
    '_id', 'museum', 'collection', 'length', 'width', 'thickness', 'cdliNumber', 'accession', 'description', 'publication', 'transliteration'
  ]

  for (let property of properties) {
    it(`renders ${property}`, () => {
      expect(conatiner).toHaveTextContent(fragment[property])
    })
  }

  const arrayProperties = [
    'folio', 'joins'
  ]

  for (let property of arrayProperties) {
    it(`renders all items of ${property}`, () => {
      for (let item of fragment[property]) {
        expect(conatiner).toHaveTextContent(item)
      }
    })
  }

  it(`renders all records`, () => {
    for (let record of fragment.record) {
      expect(conatiner).toHaveTextContent(record.user)
    }
  })
})
