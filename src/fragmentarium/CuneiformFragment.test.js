import React from 'react'
import { matchPath } from 'react-router'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import CuneiformFragment from './CuneiformFragment'
import HttpClient from '../http/HttpClient'
import Auth from '../auth0/Auth'
import moment from 'moment'

let fragment
let httpClient
let textContent
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
    textContent = element.container.textContent
  })

  const properties = [
    '_id', 'museum', 'collection', 'length', 'width', 'thickness', 'cdliNumber', 'accession', 'genre', 'publication', 'transliteration'
  ]

  for (let property of properties) {
    it(`renders ${property}`, () => {
      expect(textContent).toContain(fragment[property])
    })
  }

  const arrayProperties = [
    'folio', 'joins'
  ]

  for (let property of arrayProperties) {
    it(`renders all items of ${property}`, () => {
      for (let item of fragment[property]) {
        expect(textContent).toContain(item)
      }
    })
  }

  it(`renders all records`, () => {
    for (let record of fragment.record) {
      expect(textContent).toContain(`${record.user} (${record.type}, ${moment(record.date).format('D/M/YYYY')})`)
    }
  })
})
