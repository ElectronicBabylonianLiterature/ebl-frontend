import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import _ from 'lodash'
import { screen, render } from '@testing-library/react'

import Details from './Details'
import { Museums } from 'fragmentarium/domain/museum'
import { Fragment } from 'fragmentarium/domain/fragment'
import Promise from 'bluebird'
import { Genres } from 'fragmentarium/domain/Genres'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  archaeologyFactory,
  externalNumbersFactory,
  measuresFactory,
} from 'test-support/fragment-data-fixtures'
import { joinFactory } from 'test-support/join-fixtures'
import { PartialDate } from 'fragmentarium/domain/archaeology'
import { Periods } from 'common/period'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'

jest.mock('fragmentarium/application/FragmentService')

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const MockDossiersService = DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>
const fragmentService = new MockFragmentService()
const dossiersService = new MockDossiersService()

const updateGenres = jest.fn()
const updateScript = jest.fn()
const updateDate = jest.fn()
const updateDatesInText = jest.fn()

let fragment: Fragment

async function renderDetails() {
  render(
    <MemoryRouter>
      <Details
        fragment={fragment}
        updateGenres={updateGenres}
        updateScript={updateScript}
        updateDate={updateDate}
        updateDatesInText={updateDatesInText}
        fragmentService={fragmentService}
        dossiersService={dossiersService}
      />
    </MemoryRouter>
  )
  await waitForSpinnerToBeRemoved(screen)
}

describe('All details', () => {
  beforeEach(async () => {
    fragmentService.fetchGenres.mockReturnValue(
      Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']])
    )
    fragmentService.fetchPeriods.mockReturnValue(
      Promise.resolve([...Object.keys(Periods)])
    )
    const number = 'X.1'
    const museum = Museums['THE_BRITISH_MUSEUM']
    fragment = fragmentFactory.build(
      {
        number,
        collection: 'The Collection',
        museum,
      },
      {
        associations: {
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
              joinFactory.build({ isEnvelope: true }),
            ],
          ],
        },
      }
    )
    await renderDetails()
  })

  it('Renders museum', () => {
    expect(screen.getByText(fragment.museum.name)).toBeInTheDocument()
  })

  it('Links to museum home', () => {
    expect(screen.getByText(fragment.museum.name)).toHaveAttribute(
      'href',
      fragment.museum.url
    )
  })

  it('Renders collection', () => {
    expect(
      screen.getByText(`(${fragment.collection} Collection)`)
    ).toBeInTheDocument()
  })

  it(`Renders envelope icon for joins`, () => {
    expect(screen.queryAllByLabelText('envelope icon').length).toBeGreaterThan(
      0
    )
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
        ).toHaveAttribute('href', `/library/${join.museumNumber}`)
      })
  })

  it('Renders measures', () => {
    const expectedMeasures = `${fragment.measures.length} (L) × ${fragment.measures.width} (W) × ${fragment.measures.thickness} (T) cm`
    expect(screen.getByText(expectedMeasures)).toBeInTheDocument()
  })

  it('Renders accession', () => {
    expect(
      screen.getByText(`Accession no.: ${fragment.accession}`)
    ).toBeInTheDocument()
  })

  it('Renders excavation', () => {
    expect(
      screen.getByText(
        `Excavation no.: ${fragment.archaeology?.excavationNumber}`
      )
    ).toBeInTheDocument()
  })

  it('Renders provenance', () => {
    expect(
      screen.getByText(`Provenance: ${fragment.archaeology?.site?.name}`)
    ).toBeInTheDocument()
  })
})

describe('ExcavationDate', () => {
  beforeEach(() => {
    fragmentService.fetchGenres.mockResolvedValue([])
    fragmentService.fetchPeriods.mockResolvedValue([])
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
    })
  })

  it('renders excavation date when isRegularExcavation is true', async () => {
    const excavationDate = {
      start: new PartialDate(2024, 5, 10),
      end: new PartialDate(2024, 10, 10),
    }
    fragment = fragmentFactory.build({
      archaeology: {
        isRegularExcavation: true,
        date: excavationDate,
      },
    })
    await renderDetails()

    expect(screen.getByText(/Regular Excavation/)).toBeInTheDocument()
    expect(screen.getByText(/05\/10\/2024 – 10\/10\/2024/)).toBeInTheDocument()
  })

  it('renders only start date when end date is missing', async () => {
    const excavationDate = {
      start: new PartialDate(2024, 5, 10),
      end: null,
    }
    fragment = fragmentFactory.build({
      archaeology: {
        isRegularExcavation: true,
        date: excavationDate,
      },
    })
    await renderDetails()

    expect(screen.getByText(/Regular Excavation/)).toBeInTheDocument()
    expect(screen.getByText(/05\/10\/2024/)).toBeInTheDocument()
  })

  it('does not render excavation date when isRegularExcavation is false', async () => {
    fragment = fragmentFactory.build({
      archaeology: {
        isRegularExcavation: false,
        date: undefined,
      },
    })
    await renderDetails()

    expect(screen.queryByText(/Regular Excavation/)).not.toBeInTheDocument()
    expect(screen.queryByText(/10\/05\/2024/)).not.toBeInTheDocument()
  })
})

describe('Missing details', () => {
  beforeEach(async () => {
    const archaeology = archaeologyFactory.build({
      excavationNumber: undefined,
      site: undefined,
    })
    fragment = fragmentFactory.build(
      {
        collection: '',
        accession: '',
        archaeology,
      },
      {
        associations: {
          joins: [],
          measures: measuresFactory.build({
            width: null,
          }),
          externalNumbers: externalNumbersFactory.build({
            cdliNumber: '',
            bmIdNumber: '',
          }),
        },
      }
    )
    fragmentService.fetchGenres.mockReturnValue(Promise.resolve([]))
    fragmentService.fetchPeriods.mockReturnValue(Promise.resolve([]))
    await renderDetails()
  })

  it('Does not render undefined', () =>
    expect(screen.queryByText('undefined')).not.toBeInTheDocument())

  it('Does not render collection', () =>
    expect(screen.queryByText('Collection')).not.toBeInTheDocument())

  it(`Renders dash for joins`, () => {
    expect(screen.getByText(/Joins:/)).toHaveTextContent('-')
  })

  it('Does not render missing measures', () => {
    expect(
      screen.getByText(
        `${fragment.measures.length} (L) × ${fragment.measures.thickness} (T) cm`
      )
    ).toBeInTheDocument()
  })

  it('Renders dash for accession', () => {
    expect(screen.getByText('Accession no.: -')).toBeInTheDocument()
  })
  it('Renders dash for excavation', () => {
    expect(screen.getByText('Excavation no.: -')).toBeInTheDocument()
  })
  it('Renders dash for provenance', () => {
    expect(screen.getByText('Provenance: -')).toBeInTheDocument()
  })
})
