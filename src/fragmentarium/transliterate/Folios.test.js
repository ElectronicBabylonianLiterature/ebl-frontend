import React from 'react'
import { render, cleanup } from 'react-testing-library'
import { factory } from 'factory-girl'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import Folios from './Folios'

const cdliNumber = '0000'
let apiClient
let container
let folios

afterEach(cleanup)

beforeEach(() => {
  apiClient = new ApiClient(new Auth())
  URL.createObjectURL.mockReturnValue('url')
  jest.spyOn(apiClient, 'fetchBlob').mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
})

describe('Folios', () => {
  beforeEach(async () => {
    folios = await factory.buildMany('folio', 3)
    container = render(<Folios folios={folios} cdliNumber={cdliNumber} apiClient={apiClient} />).container
  })

  it(`Renders folio numbers entries`, () => {
    for (let folio of folios) {
      expect(container).toHaveTextContent(folio.number)
    }
  })

  it(`Renders CDLI image`, () => {
    expect(container).toHaveTextContent('CDLI Image')
  })
})

const names = [
  { name: 'WGL', displayName: 'Lambert' },
  { name: 'FWG', displayName: 'Geers' },
  { name: 'EL', displayName: 'Leichty' },
  { name: 'AKG', displayName: 'Grayson' }
]

names.forEach(entry => {
  describe(`${entry.displayName} Folios`, () => {
    beforeEach(async () => {
      folios = [await factory.build('folio', { name: entry.name })]
      container = render(<Folios folios={folios} cdliNumber='' apiClient={apiClient} />).container
    })

    it(`Renders folio numbers entries`, () => {
      for (let folio of folios) {
        expect(container).toHaveTextContent(`${entry.displayName} Folio ${folio.number}`)
      }
    })
  })
})

describe('No folios or CDLI imgae', () => {
  beforeEach(async () => {
    container = render(<Folios folios={[]} cdliNumber='' apiClient={apiClient} />).container
  })

  it(`Renders no folios test`, () => {
    expect(container).toHaveTextContent('No folios')
  })
})
