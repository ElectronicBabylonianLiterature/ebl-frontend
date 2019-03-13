import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import Details from './Details'
import { List } from 'immutable'

let fragment
let container
let element

function renderDetails () {
  element = render(<MemoryRouter><Details fragment={fragment} /></MemoryRouter>)
  container = element.container
}

describe('All details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', { museum: 'The British Museum', hits: 0 })
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
    const expectedMeasures = `${fragment.measures.length} × ${fragment.measures.width} × ${fragment.measures.thickness} cm`
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

  it('Renders hits', () => {
    expect(container).toHaveTextContent(`Cited in ${fragment.hits} documents`)
  })
})

describe('Missing details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      collection: '',
      joins: List(),
      cdliNumber: '',
      accession: '',
      bmIdNumber: '',
      measures: await factory.build('measures', {
        width: null
      })
    })
    renderDetails()
  })

  it('Does not render undefined', () => {
    expect(container).not.toHaveTextContent('undefined')
  })

  it('Does not render colection', () => {
    expect(container).not.toHaveTextContent('Collection')
  })

  it('Does not render hits', () => {
    expect(container).not.toHaveTextContent('Cited in')
  })

  it(`Renders dash for joins`, () => {
    expect(container).toHaveTextContent('Joins: -')
  })

  it('Does not renders missing measures', () => {
    const expectedMeasures = `${fragment.measures.length} × ${fragment.measures.thickness} cm`
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
