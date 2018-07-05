import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import Details from './Details'

let fragment
let textContent
let element

function renderDetails () {
  element = render(<Details fragment={fragment} />)
  textContent = element.container.textContent
}
afterEach(cleanup)

describe('All details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {museum: 'The British Museum'})
    renderDetails()
  })

  it('Renders museum', () => {
    expect(textContent).toContain(`${fragment.museum}`)
  })

  it('Links museum', () => {
    expect(element.getByText(fragment.museum).href).toEqual('http://britishmuseum.org/')
  })

  it('Renders colection', () => {
    expect(textContent).toContain(`(${fragment.collection} Collection)`)
  })

  it(`Renders all joins`, () => {
    for (let item of fragment.joins) {
      expect(textContent).toContain(item)
    }
  })

  it('Renders measures', () => {
    expect(textContent).toContain(`${fragment.length} x ${fragment.width} x ${fragment.thickness} cm`)
  })

  it('Renders CDLI number', () => {
    expect(textContent).toContain(`CDLI: ${fragment.cdliNumber}`)
  })

  it('Links CDLI number', () => {
    expect(element.getByText(fragment.cdliNumber).href).toEqual(`https://cdli.ucla.edu/${fragment.cdliNumber}`)
  })

  it('Renders accession', () => {
    expect(textContent).toContain(`Accession: ${fragment.accession}`)
  })
})

describe('Missing details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      collection: '',
      joins: [],
      cdliNumber: '',
      accession: ''
    })
    renderDetails()
  })

  it('Does not link museum', () => {
    expect(element.getByText(fragment.museum).href).toBeFalsy()
  })

  it('Does not renders colection', () => {
    expect(textContent).not.toContain('Collection')
  })

  it(`Renders dash for joins`, () => {
    expect(textContent).toContain('Joins: -')
  })

  it('Renders dash for CDLI number', () => {
    expect(textContent).toContain('CDLI: -')
  })

  it('Renders dash for accession', () => {
    expect(textContent).toContain('Accession: -')
  })
})
