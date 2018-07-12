import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import Folio from './Folio'

const cdliNumber = '0000'
let apiClient
let container
let folio

afterEach(cleanup)

beforeEach(() => {
  apiClient = new ApiClient(new Auth())
  URL.createObjectURL.mockReturnValue('url')
  jest.spyOn(apiClient, 'fetchBlob').mockReturnValue(Promise.resolve(new Blob([''], {type: 'image/jpeg'})))
})

describe('Folios', () => {
  beforeEach(async () => {
    folio = await factory.buildMany('folio', 3)
    container = render(<Folio folio={folio} cdliNumber={cdliNumber} apiClient={apiClient} />).container
  })

  it(`Renders folio numbers entries`, () => {
    for (let item of folio) {
      expect(container).toHaveTextContent(item.number)
    }
  })

  it(`Renders CDLI image`, () => {
    expect(container).toHaveTextContent('CDLI Image')
  })
})

const names = [
  {name: 'WGL', displayName: 'Lambert'},
  {name: 'FWG', displayName: 'Geers'},
  {name: 'EL', displayName: 'Leichty'}
]

names.forEach(entry => {
  describe(`${entry.displayName} Folios`, () => {
    beforeEach(async () => {
      folio = [await factory.build('folio', {name: entry.name})]
      container = render(<Folio folio={folio} cdliNumber='' apiClient={apiClient} />).container
    })

    it(`Renders folio numbers entries`, () => {
      for (let item of folio) {
        expect(container).toHaveTextContent(`${entry.displayName} Folio ${item.number}`)
      }
    })
  })
})

describe('No folios or CDLI imgae', () => {
  beforeEach(async () => {
    container = render(<Folio folio={[]} cdliNumber='' apiClient={apiClient} />).container
  })

  it(`Renders no folios test`, () => {
    expect(container).toHaveTextContent('No folios')
  })
})
