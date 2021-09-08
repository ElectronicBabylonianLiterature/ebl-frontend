import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import _ from 'lodash'

import Details from './Details'
import Museum from 'fragmentarium/domain/museum'
import { Fragment } from 'fragmentarium/domain/fragment'
import Promise from 'bluebird'
import { Genres } from 'fragmentarium/domain/Genres'
import {
  fragmentFactory,
  measuresFactory,
} from 'test-support/fragment-fixtures'
import { joinFactory } from 'test-support/join-fixtures'

const updateGenres = jest.fn()
const fragmentService = {
  fetchGenres: jest.fn(),
}
let fragment: Fragment

async function renderDetails() {
  render(
    <MemoryRouter>
      <Details
        fragment={fragment}
        updateGenres={updateGenres}
        fragmentService={fragmentService}
      />
    </MemoryRouter>
  )
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
}

describe('All details', () => {
  beforeEach(async () => {
    fragmentService.fetchGenres.mockReturnValue(
      Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']])
    )
    const number = 'X.1'
    fragment = fragmentFactory.build(
      {
        number,
        collection: 'The Collection',
      },
      {
        associations: {
          museum: Museum.of('The British Museum'),
          genres: new Genres([]),
          joins: [
            [
              joinFactory.build({
                museumNumber: number,
                isInFragmentarium: true,
              }),
              joinFactory.build({ isInFragmentarium: true }),
            ],
            [
              joinFactory.build({ isInFragmentarium: false }),
              joinFactory.build({ isInFragmentarium: true }),
            ],
          ],
        },
      }
    )
    await renderDetails()
  })

  it('Renders museum', () => {
    expect(screen.getByText(`${fragment.museum.name}`)).toBeInTheDocument()
  })

  it('Links to museum home', () =>
    expect(screen.getByText(fragment.museum.name)).toHaveAttribute(
      'href',
      'https://britishmuseum.org/'
    ))

  it('Renders colection', () => {
    expect(
      screen.getByText(`(${fragment.collection} Collection)`)
    ).toBeInTheDocument()
  })

  it('Does not link to self', () => {
    fragment.joins
      .flat()
      .filter((join) => join.museumNumber === fragment.number)
      .forEach((join) => {
        expect(screen.getByText(join.museumNumber)).not.toHaveAttribute('href')
      })
  })

  it('Does not link to missing joins', () => {
    fragment.joins
      .flat()
      .filter((join) => !join.isInFragmentarium)
      .forEach((join) => {
        expect(
          screen.getByText(new RegExp(_.escapeRegExp(join.museumNumber)))
        ).not.toHaveAttribute('href')
      })
  })

  it('Links to other joins', () => {
    fragment.joins
      .flat()
      .filter((join) => join.museumNumber !== fragment.number)
      .filter((join) => join.isInFragmentarium)
      .forEach((join) => {
        expect(
          screen.getByRole('link', { name: join.museumNumber })
        ).toHaveAttribute('href', `/fragmentarium/${join.museumNumber}`)
      })
  })

  it('Renders measures', () => {
    const expectedMeasures = `${fragment.measures.length} × ${fragment.measures.width} × ${fragment.measures.thickness} cm`
    expect(screen.getByText(expectedMeasures)).toBeInTheDocument()
  })

  it('Renders CDLI number', () => {
    expect(
      screen.getByText((_, node) => {
        return node?.textContent === `CDLI: ${fragment.cdliNumber}`
      })
    ).toBeInTheDocument()
  })

  it('Links CDLI number', () =>
    expect(screen.getByText(fragment.cdliNumber)).toHaveAttribute(
      'href',
      `https://cdli.ucla.edu/${fragment.cdliNumber}`
    ))

  it('Renders accession', () => {
    expect(
      screen.getByText(`Accession: ${fragment.accession}`)
    ).toBeInTheDocument()
  })
})

describe('Missing details', () => {
  beforeEach(async () => {
    fragment = fragmentFactory.build(
      {
        collection: '',
        cdliNumber: '',
        accession: '',
        bmIdNumber: '',
      },
      {
        associations: {
          joins: [],
          measures: measuresFactory.build({
            width: null,
          }),
        },
      }
    )
    fragmentService.fetchGenres.mockReturnValue(Promise.resolve([]))
    await renderDetails()
  })

  it('Does not render undefined', () =>
    expect(screen.queryByText('undefined')).not.toBeInTheDocument())

  it('Does not render colection', () =>
    expect(screen.queryByText('Collection')).not.toBeInTheDocument())

  it(`Renders dash for joins`, () => {
    expect(screen.getByText(/Joins:/)).toHaveTextContent('-')
  })

  it('Does not renders missing measures', () => {
    expect(
      screen.getByText(
        `${fragment.measures.length} × ${fragment.measures.thickness} cm`
      )
    ).toBeInTheDocument()
  })

  it('Renders dash for CDLI number', () => {
    expect(screen.getByText('CDLI: -')).toBeInTheDocument()
  })

  it('Renders dash for accession', () => {
    expect(screen.getByText('Accession: -')).toBeInTheDocument()
  })
})

describe('Unknown museum', () => {
  beforeEach(async () => {
    fragment = fragmentFactory.build(
      {},
      {
        associations: {
          museum: Museum.of('The Other Museum'),
        },
      }
    )
    fragmentService.fetchGenres.mockReturnValue(Promise.resolve([]))
    await renderDetails()
  })

  it('Does not link museum', () =>
    expect(screen.queryByText(fragment.museum.name)).not.toHaveAttribute(
      'href'
    ))
})
