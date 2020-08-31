import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, fireEvent, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import Details from './Details'
import Museum from 'fragmentarium/domain/museum'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fillBibliographySelect } from 'test-support/test-bibliographySelect'
import { changeValueByLabel, clickNth } from 'test-support/utils'
import exp from 'constants'

let fragmentService
let fragment: Fragment
let fragmentWithUpdatedGenre: Fragment
let container
let element: RenderResult

function renderDetails() {
  element = render(
    <MemoryRouter>
      <Details fragment={fragment} fragmentService={fragmentService} />
    </MemoryRouter>
  )
  container = element.container
}

describe('All details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      museum: Museum.of('The British Museum'),
      collection: 'The Collection',
    })
    renderDetails()
  })

  it('Renders museum', () => {
    expect(container).toHaveTextContent(`${fragment.museum.name}`)
  })

  it('Links to museum home', () => {
    expect(element.getByText(fragment.museum.name)).toHaveAttribute(
      'href',
      'https://britishmuseum.org/'
    )
  })

  it('Renders colection', () => {
    expect(container).toHaveTextContent(`(${fragment.collection} Collection)`)
  })

  it(`Renders all joins`, () => {
    for (const item of fragment.joins) {
      expect(container).toHaveTextContent(item)
    }
  })

  it(`Links all joins`, () => {
    for (const item of fragment.joins) {
      expect(element.getByText(item)).toHaveAttribute(
        'href',
        `/fragmentarium/${item}`
      )
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
    expect(element.getByText(fragment.cdliNumber)).toHaveAttribute(
      'href',
      `https://cdli.ucla.edu/${fragment.cdliNumber}`
    )
  })

  it('Renders accession', () => {
    expect(container).toHaveTextContent(`Accession: ${fragment.accession}`)
  })
})
describe('Genre selection', () => {
  beforeEach(async () => {
    fragmentService = {
      updateGenre: jest.fn(),
    }
    fragmentService.updateGenre.mockReturnValue(fragmentWithUpdatedGenre)
    fragmentWithUpdatedGenre = await factory.build('fragment', {
      genre: [['ARCHIVE', 'Administrative']],
    })
    fragment = await factory.build('fragment', {
      museum: Museum.of('The British Museum'),
      collection: 'The Collection',
      genre: [],
    })
    renderDetails()
  })
  it('Select genre & delete selected genre', async () => {
    fireEvent.click(element.getByRole('button'))

    const entry = 'ARCHIVAL -> Legal'
    changeValueByLabel(element, 'select genre', 'ARCHIVAL -> Legal')
    await element.findAllByText('ARCHIVAL -> Legal')[0]
    await clickNth(element, 'ARCHIVAL -> Legal', 0)

    await element.findByText('ARCHIVAL \uD83E\uDC02 Legal')

    fireEvent.click(element.getAllByRole('button')[1])

    expect(
      element.queryByLabelText('ARCHIVAL \uD83E\uDC02 Legal')
    ).not.toBeInTheDocument()
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
      measures: await factory.build('measures', {
        width: null,
      }),
    })
    renderDetails()
  })

  it('Does not render undefined', () => {
    expect(container).not.toHaveTextContent('undefined')
  })

  it('Does not render colection', () => {
    expect(container).not.toHaveTextContent('Collection')
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
      museum: Museum.of('The Other Museum'),
    })
    renderDetails()
  })

  it('Does not link museum', () => {
    expect(element.getByText(fragment.museum.name)).not.toHaveAttribute('href')
  })
})
