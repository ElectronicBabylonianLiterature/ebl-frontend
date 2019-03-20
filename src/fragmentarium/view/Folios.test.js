import React from 'react'
import MemoryRouter from 'react-router/MemoryRouter'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import { List } from 'immutable'
import Promise from 'bluebird'
import Folios from './Folios'

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
    folios = List(await factory.buildMany('folio', 3))
    fragment = await factory.build('fragment', { 'folios': folios })
    container = renderFolios().container
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

it('Displays selected folio', async () => {
  folios = List(await factory.buildMany('folio', 2, {}, [{ name: 'WGL' }, { name: 'AKG' }]))
  fragment = await factory.build('fragment', { 'folios': folios })
  const selected = folios.first()
  const element = renderFolios(selected)
  await waitForElement(() => element.getByText(/Browse/))
  expect(element.getByText(`${selected.humanizedName} Folio ${selected.number}`)).toHaveAttribute('aria-selected', 'true')
})

it('Displays CDLI image if no folio specified', async () => {
  folios = List(await factory.buildMany('folio', 2, {}, [{ name: 'WGL' }, { name: 'AKG' }]))
  fragment = await factory.build('fragment', { 'folios': folios })
  const element = renderFolios()
  await waitForElement(() => element.getByAltText(`${fragment.cdliNumber}.jpg`))
})

describe('No folios or CDLI image', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', { 'folios': List(), 'cdliNumber': '' })
    container = renderFolios().container
  })

  it(`Renders no folios text`, () => {
    expect(container).toHaveTextContent('No folios')
  })
})

function renderFolios (activeFolio = null) {
  return render(<MemoryRouter>
    <Folios fragment={fragment} fragmentService={fragmentService} activeFolio={activeFolio} />
  </MemoryRouter>)
}
