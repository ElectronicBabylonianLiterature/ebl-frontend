import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { factory } from 'factory-girl'
import Details from './Details'
import Museum from 'fragmentarium/domain/museum'
import { Fragment } from 'fragmentarium/domain/fragment'
import selectEvent from 'react-select-event'
import userEvent from '@testing-library/user-event'

const updateGenre = jest.fn()
let fragment: Fragment

function renderDetails() {
  render(
    <MemoryRouter>
      <Details fragment={fragment} updateGenre={updateGenre} />
    </MemoryRouter>
  )
}

describe('All details', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      museum: Museum.of('The British Museum'),
      collection: 'The Collection',
      genre: [],
    })
    renderDetails()
  })

  it('Renders museum', () => {
    screen.getByText(`${fragment.museum.name}`)
  })

  it('Links to museum home', () =>
    expect(screen.getByText(fragment.museum.name)).toHaveAttribute(
      'href',
      'https://britishmuseum.org/'
    ))

  it('Renders colection', () => {
    screen.getByText(`(${fragment.collection} Collection)`)
  })

  it(`Renders all joins`, () => {
    for (const item of fragment.joins) {
      screen.getByText(item)
    }
  })

  it(`Links all joins`, () => {
    for (const item of fragment.joins) {
      expect(screen.getByText(item)).toHaveAttribute(
        'href',
        `/fragmentarium/${item}`
      )
    }
  })

  it('Renders measures', () => {
    const expectedMeasures = `${fragment.measures.length} × ${fragment.measures.width} × ${fragment.measures.thickness} cm`
    screen.getByText(expectedMeasures)
  })

  it('Renders CDLI number', () => {
    screen.getByText((content, node) => {
      const hasText = (node) =>
        node.textContent === `CDLI: ${fragment.cdliNumber}`
      const nodeHasText = hasText(node)
      const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child)
      )

      return nodeHasText && childrenDontHaveText
    })
  })

  it('Links CDLI number', () =>
    expect(screen.getByText(fragment.cdliNumber)).toHaveAttribute(
      'href',
      `https://cdli.ucla.edu/${fragment.cdliNumber}`
    ))

  it('Renders accession', () => {
    screen.getByText(`Accession: ${fragment.accession}`)
  })
  it('Select genre & delete selected genre', async () => {
    userEvent.click(screen.getByRole('button'))
    act(() => {
      selectEvent.select(
        screen.getByLabelText('select genre'),
        'ARCHIVAL -> Legal'
      )
    })
    await waitForElementToBeRemoved(screen.getByLabelText('select genre'))

    expect(updateGenre).toHaveBeenCalledWith([['ARCHIVAL', 'Legal']])
    screen.findByText('ARCHIVAL \uD83E\uDC02 Legal')

    userEvent.click(screen.getAllByRole('button')[1])

    expect(
      screen.queryByLabelText('ARCHIVAL \uD83E\uDC02 Legal')
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

  it('Does not render undefined', () =>
    expect(screen.queryByText('undefined')).not.toBeInTheDocument())

  it('Does not render colection', () =>
    expect(screen.queryByText('Collection')).not.toBeInTheDocument())

  it(`Renders dash for joins`, () => {
    screen.getByText('Joins: -')
  })

  it('Does not renders missing measures', () => {
    screen.getByText(
      `${fragment.measures.length} × ${fragment.measures.thickness} cm`
    )
  })

  it('Renders dash for CDLI number', () => {
    screen.getByText('CDLI: -')
  })

  it('Renders dash for accession', () => {
    screen.getByText('Accession: -')
  })
})

describe('Unknown museum', () => {
  beforeEach(async () => {
    fragment = await factory.build('fragment', {
      museum: Museum.of('The Other Museum'),
    })
    renderDetails()
  })

  it('Does not link museum', () =>
    expect(screen.queryByText(fragment.museum.name)).not.toHaveAttribute(
      'href'
    ))
})
