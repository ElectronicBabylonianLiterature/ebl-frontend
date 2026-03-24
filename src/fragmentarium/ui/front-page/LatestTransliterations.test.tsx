import React from 'react'
import { render, screen } from '@testing-library/react'
import Chance from 'chance'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import LatestTransliterations from './LatestTransliterations'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { queryItemOf } from 'test-support/utils'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')

const chance = new Chance('latest-test')

let fragments: Fragment[]

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()

const setup = async (
  mode: 'homepage' | 'library' = 'library',
  numberOfFragments = 2,
): Promise<void> => {
  fragments = fragmentFactory.buildList(
    numberOfFragments,
    {},
    { transient: { chance } },
  )
  fragmentService.queryLatest.mockReturnValueOnce(
    Promise.resolve({
      items: fragments.map(queryItemOf),
      matchCountTotal: 0,
    }),
  )
  fragmentService.find.mockImplementation((museumNumber: string) => {
    const matchingFragment = fragments.find(
      (fragment) => fragment.number === museumNumber,
    )
    if (!matchingFragment) {
      throw new Error(`Fragment not found in test setup: ${museumNumber}`)
    }
    return Promise.resolve(matchingFragment)
  })

  render(
    <MemoryRouter>
      <LatestTransliterations
        fragmentService={fragmentService}
        dossiersService={dossiersService}
        mode={mode}
      />
    </MemoryRouter>,
  )
  await screen.findByText(
    mode === 'homepage' ? 'Latest Additions' : 'Latest Transliterations',
  )
}

test('renders the library section heading by default', async () => {
  await setup()
  expect(screen.getByText('Latest Transliterations')).toBeInTheDocument()
})

test('renders fragment numbers', async () => {
  await setup()
  expect(screen.getByText(fragments[0].number)).toBeInTheDocument()
  expect(screen.getByText(fragments[1].number)).toBeInTheDocument()
})

test('renders homepage heading and view-all link in homepage mode', async () => {
  await setup('homepage')
  expect(screen.getByText('Latest Additions')).toBeInTheDocument()
  expect(screen.getByText('View all →')).toHaveAttribute('href', '/library')
})

test('does not render view-all link in library mode', async () => {
  await setup('library')
  expect(screen.queryByText('View all →')).not.toBeInTheDocument()
})

test('shows all recently modified editions in library mode', async () => {
  await setup('library', 6)
  fragments.forEach((fragment) => {
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
  })
})

test('shows only the top five editions on homepage mode', async () => {
  await setup('homepage', 6)
  fragments.slice(0, 5).forEach((fragment) => {
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
  })
  expect(screen.queryByText(fragments[5].number)).not.toBeInTheDocument()
})

test('shows full metadata details in library mode', async () => {
  await setup('library', 1)
  expect(screen.getByText(/Accession no\.:/)).toBeInTheDocument()
  expect(screen.getByText(/Excavation no\.:/)).toBeInTheDocument()
  expect(screen.getByText(/Provenance:/)).toBeInTheDocument()
  expect(screen.getByText('References')).toBeInTheDocument()
})
