import React from 'react'
import { matchPath } from 'react-router'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import CuneiformFragment from './CuneiformFragment'
import HttpClient from '../http/HttpClient'
import Auth from '../auth0/Auth'

let fragment
let httpClient
let conatiner
let element

afterEach(cleanup)

describe('fragment display', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment')
    httpClient = new HttpClient(new Auth())
    jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    const match = matchPath(`/fragmentarium/${fragment._id}`, {
      path: '/fragmentarium/:id'
    })
    element = render(<CuneiformFragment match={match} httpClient={httpClient} />)
    await wait()
    conatiner = element.container
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
