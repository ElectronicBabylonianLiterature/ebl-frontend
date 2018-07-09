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
    '_id', 'museum', 'collection', 'cdliNumber', 'accession', 'description', 'publication', 'transliteration'
  ]

  for (let property of properties) {
    it(`renders ${property}`, () => {
      expect(container).toHaveTextContent(fragment[property])
    })
  }

  it('renders all joins', () => {
    for (let item of fragment.joins) {
      expect(container).toHaveTextContent(item)
    }
  })

  it('renders all measures', () => {
    for (let property of ['length', 'width', 'thickness']) {
      expect(container).toHaveTextContent(fragment[property].value)
    }
  })

  it('renders all records', () => {
    for (let record of fragment.record) {
      expect(container).toHaveTextContent(record.user)
    }
  })

  it('renders all folios', () => {
    for (let folio of fragment.folio) {
      expect(container).toHaveTextContent(folio.number)
    }
  })
})
