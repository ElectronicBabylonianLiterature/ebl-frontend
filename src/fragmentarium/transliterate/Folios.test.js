import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import Folios from './Folios'
import MemoryRouter from 'react-router/MemoryRouter';

let fragment
let fragmentService
let container
let folios
let folioPager

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn(),
    folioPager: jest.fn()
  }
  folioPager = await factory.build('folioPager')
  URL.createObjectURL.mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
})

describe('Folios', () => {
  beforeEach(async () => {
    folios = await factory.buildMany('folio', 3)
    fragment = await factory.build('fragment', { 'folios': folios })
    container = render(<MemoryRouter>
      <Folios fragment={fragment} fragmentService={fragmentService} />
    </MemoryRouter>).container
  })

  it(`Renders folio numbers entries`, () => {
    for (let folio of folios) {
      expect(container).toHaveTextContent(folio.number)
    }
  })

  it(`Renders folio numbers entries`, () => {
    for (let folio of folios) {
      expect(container).toHaveTextContent(`${folio.humanizedName} Folio ${folio.number}`)
    }
  })

  it(`Renders CDLI image`, () => {
    expect(container).toHaveTextContent('CDLI Image')
  })
})

describe('No folios or CDLI image', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', { 'folios': [], 'cdliNumber': '' })
    container = render(<MemoryRouter>
      <Folios fragment={fragment} fragmentService={fragmentService} />
    </MemoryRouter>).container
  })

  it(`Renders no folios test`, () => {
    expect(container).toHaveTextContent('No folios')
  })
})
