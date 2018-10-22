import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import Folios from './Folios'

let fragment
let fragmentService
let container
let folios

beforeEach(() => {
  fragmentService = {
    findFolio: jest.fn()
  }
  URL.createObjectURL.mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
})

describe('Folios', () => {
  beforeEach(async () => {
    folios = await factory.buildMany('folio', 3)
    fragment = await factory.build('fragment', { 'folios': folios })
    container = render(<Folios fragment={fragment} fragmentService={fragmentService} />).container
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
  { name: 'AKG', displayName: 'Grayson' },
  { name: 'MJG', displayName: 'Geller' }
]

names.forEach(entry => {
  describe(`${entry.displayName} Folios`, () => {
    beforeEach(async () => {
      folios = [await factory.build('folio', { name: entry.name })]
      fragment = await factory.build('fragment', { 'folios': folios, 'cdliNumber': '' })
      container = render(<Folios fragment={fragment} fragmentService={fragmentService} />).container
    })

    it(`Renders folio numbers entries`, () => {
      for (let folio of folios) {
        expect(container).toHaveTextContent(`${entry.displayName} Folio ${folio.number}`)
      }
    })
  })
})

describe('No folios or CDLI image', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', { 'folios': [], 'cdliNumber': '' })
    container = render(<Folios fragment={fragment} fragmentService={fragmentService} />).container
  })

  it(`Renders no folios test`, () => {
    expect(container).toHaveTextContent('No folios')
  })
})
