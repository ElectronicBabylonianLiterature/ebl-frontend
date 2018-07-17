import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, cleanup } from 'react-testing-library'
import { factory } from 'factory-girl'
import Details from './Details'

let fragment
let container
let element

function renderDetails () {
  element = render(<MemoryRouter><Details fragment={fragment} /></MemoryRouter>)
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

  it('Links to museum home', () => {
    expect(element.getByText(fragment.museum)).toHaveAttribute('href', 'https://britishmuseum.org/')
  })

  it('Renders colection', () => {
    expect(container).toHaveTextContent(`(${fragment.collection} Collection)`)
  })

  it(`Renders all joins`, () => {
    for (let item of fragment.joins) {
      expect(container).toHaveTextContent(item)
    }
  })

  it(`Links all joins`, () => {
    for (let item of fragment.joins) {
      expect(element.getByText(item))
        .toHaveAttribute('href', `/fragmentarium/${item}`)
    }
  })

  it('Renders measures', () => {
    const expectedMeasures = `${fragment.length.value} × ${fragment.width.value} × ${fragment.thickness.value} cm`
    expect(container).toHaveTextContent(expectedMeasures)
  })

  it('Renders CDLI number', () => {
    expect(container).toHaveTextContent(`CDLI: ${fragment.cdliNumber}`)
  })

  it('Links CDLI number', () => {
    expect(element.getByText(fragment.cdliNumber))
      .toHaveAttribute('href', `https://cdli.ucla.edu/${fragment.cdliNumber}`)
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
      bmIdNumber: '',
      width: {}
    })
    renderDetails()
  })

  it('Does not render undefined', () => {
    expect(container).not.toHaveTextContent('undefined')
  })

  it('Does not renders colection', () => {
    expect(container).not.toHaveTextContent('Collection')
  })

  it(`Renders dash for joins`, () => {
    expect(container).toHaveTextContent('Joins: -')
  })

  it('Does not renders missing measures', () => {
    const expectedMeasures = `${fragment.length.value} × ${fragment.thickness.value} cm`
    expect(container).toHaveTextContent(expectedMeasures)
  })

  it('Renders dash for CDLI number', () => {
    expect(container).toHaveTextContent('CDLI: -')
  })

  it('Renders dash for accession', () => {
    expect(container).toHaveTextContent('Accession: -')
  })
})

describe('Unknown museum', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      museum: 'The Other Museum'
    })
    renderDetails()
  })

  it('Does not link museum', () => {
    expect(element.getByText(fragment.museum)).not.toHaveAttribute('href')
  })
})
