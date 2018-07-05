import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import CuneiformFragment from './CuneiformFragment'

let fragment
let container

afterEach(cleanup)

describe('fragment display', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment')
    container = render(<CuneiformFragment fragment={fragment} />).container
  })

  const properties = [
    '_id', 'museum', 'collection', 'length', 'width', 'thickness', 'cdliNumber', 'accession', 'description', 'publication', 'transliteration'
  ]

  for (let property of properties) {
    it(`renders ${property}`, () => {
      expect(container).toHaveTextContent(fragment[property])
    })
  }

  const arrayProperties = [
    'folio', 'joins'
  ]

  for (let property of arrayProperties) {
    it(`renders all items of ${property}`, () => {
      for (let item of fragment[property]) {
        expect(container).toHaveTextContent(item)
      }
    })
  }

  it(`renders all records`, () => {
    for (let record of fragment.record) {
      expect(container).toHaveTextContent(record.user)
    }
  })
})
