import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import GenresList from './GenresList'
import FragmentService from 'fragmentarium/application/FragmentService'

jest.mock('fragmentarium/application/FragmentService')

const genres = [
  ['ARCHIVAL'],
  ['ARCHIVAL', 'Administrative'],
  ['ARCHIVAL', 'Administrative', 'Expenditure'],
  ['CANONICAL'],
  ['CANONICAL', 'Catalogues'],
]

const statistics = {
  '["ARCHIVAL"]': 150,
  '["ARCHIVAL","Administrative"]': 75,
  '["ARCHIVAL","Administrative","Expenditure"]': 30,
  '["CANONICAL"]': 200,
  '["CANONICAL","Catalogues"]': 50,
}

let fragmentService: jest.Mocked<FragmentService>

beforeEach(() => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  global.fetch = jest.fn()
})

function renderGenresList() {
  return render(
    <MemoryRouter>
      <GenresList fragmentService={fragmentService} />
    </MemoryRouter>
  )
}

it('Displays loading spinner initially', () => {
  fragmentService.fetchGenres.mockReturnValue(
    new Promise(() => {
      // Never resolves
    })
  )
  ;(global.fetch as jest.Mock).mockReturnValue(
    new Promise(() => {
      // Never resolves
    })
  )
  renderGenresList()
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('Displays genres in hierarchical structure', async () => {
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve(genres))
  ;(global.fetch as jest.Mock).mockResolvedValue({
    json: async () => statistics,
  })
  renderGenresList()

  await waitFor(() => {
    expect(screen.getByText('ARCHIVAL')).toBeInTheDocument()
    expect(screen.getByText('Administrative')).toBeInTheDocument()
    expect(screen.getByText('Expenditure')).toBeInTheDocument()
    expect(screen.getByText('CANONICAL')).toBeInTheDocument()
    expect(screen.getByText('Catalogues')).toBeInTheDocument()
  })
})

it('Displays error message on fetch failure', async () => {
  const errorMessage = 'Failed to fetch genres'
  fragmentService.fetchGenres.mockReturnValue(
    Promise.reject(new Error(errorMessage))
  )
  ;(global.fetch as jest.Mock).mockResolvedValue({
    json: async () => statistics,
  })
  renderGenresList()

  await waitFor(() => {
    expect(screen.getByText('Error loading genres')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})

it('Displays info message when no genres available', async () => {
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve([]))
  ;(global.fetch as jest.Mock).mockResolvedValue({
    json: async () => ({}),
  })
  renderGenresList()

  await waitFor(() => {
    expect(screen.getByText('No genres available.')).toBeInTheDocument()
  })
})

it('Displays genre statistics with item counts', async () => {
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve(genres))
  ;(global.fetch as jest.Mock).mockResolvedValue({
    json: async () => statistics,
  })
  renderGenresList()

  await waitFor(() => {
    expect(screen.getByText('150 items')).toBeInTheDocument()
    expect(screen.getByText('200 items')).toBeInTheDocument()
  })
})
