import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import Details from './Details'

let fragment
let container
let element

function renderDetails () {
  element = render(<Details fragment={fragment} />)
  container = element.container
}
afterEach(cleanup)

describe('All details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {museum: 'The British Museum'})
    renderDetails()
  })

  it('Renders museum', () => {
    expect(container).toHaveTextContent(`${fragment.museum}`)
  })

  it('Links museum record', () => {
    expect(element.getByText(fragment.museum).href).toEqual(`https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${fragment.bmIdNumber}&partId=1`)
  })

  it('Renders colection', () => {
    expect(container).toHaveTextContent(`(${fragment.collection} Collection)`)
  })

  it(`Renders all joins`, () => {
    for (let item of fragment.joins) {
      expect(container).toHaveTextContent(item)
    }
  })

  it('Renders measures', () => {
    expect(container).toHaveTextContent(`${fragment.length} x ${fragment.width} x ${fragment.thickness} cm`)
  })

  it('Renders CDLI number', () => {
    expect(container).toHaveTextContent(`CDLI: ${fragment.cdliNumber}`)
  })

  it('Links CDLI number', () => {
    expect(element.getByText(fragment.cdliNumber).href).toEqual(`https://cdli.ucla.edu/${fragment.cdliNumber}`)
  })

  it('Renders accession', () => {
    expect(container).toHaveTextContent(`Accession: ${fragment.accession}`)
  })
})

describe('Missing details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      collection: '',
      joins: [],
      cdliNumber: '',
      accession: '',
      bmIdNumber: ''
    })
    renderDetails()
  })

  it('Links to museum home', () => {
    expect(element.getByText(fragment.museum).href).toEqual(`https://britishmuseum.org/`)
  })

  it('Does not renders colection', () => {
    expect(container).not.toHaveTextContent('Collection')
  })

  it(`Renders dash for joins`, () => {
    expect(container).toHaveTextContent('Joins: -')
  })

  it('Renders dash for CDLI number', () => {
    expect(container).toHaveTextContent('CDLI: -')
  })

  it('Renders dash for accession', () => {
    expect(container).toHaveTextContent('Accession: -')
  })
})

describe('Unknown musuem', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      museum: 'The Other Museum'
    })
    renderDetails()
  })

  it('Does not link museum', () => {
    expect(element.getByText(fragment.museum).href).toBeFalsy()
  })
})
