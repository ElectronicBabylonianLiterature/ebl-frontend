import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import GenresList from './GenresList'
import FragmentService from 'fragmentarium/application/FragmentService'

jest.mock('fragmentarium/application/FragmentService')

const mockGenres = [
  ['ARCHIVAL'],
  ['ARCHIVAL', 'Administrative'],
  ['ARCHIVAL', 'Administrative', 'Expenditure'],
  ['CANONICAL'],
  ['CANONICAL', 'Catalogues'],
]

let fragmentService: jest.Mocked<FragmentService>

beforeEach(() => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
})

test('Displays loading spinner initially', () => {
  fragmentService.fetchGenres.mockReturnValue(
    new Promise(() => {
      // Never resolves
    })
  )
  render(<GenresList fragmentService={fragmentService} />)
  expect(screen.getByRole('status')).toBeInTheDocument()
})

test('Displays genres in hierarchical structure', async () => {
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve(mockGenres))
  render(<GenresList fragmentService={fragmentService} />)

  await waitFor(() => {
    expect(screen.getByText('ARCHIVAL')).toBeInTheDocument()
    expect(screen.getByText('Administrative')).toBeInTheDocument()
    expect(screen.getByText('Expenditure')).toBeInTheDocument()
    expect(screen.getByText('CANONICAL')).toBeInTheDocument()
    expect(screen.getByText('Catalogues')).toBeInTheDocument()
  })
})

test('Displays error message on fetch failure', async () => {
  const errorMessage = 'Failed to fetch genres'
  fragmentService.fetchGenres.mockReturnValue(
    Promise.reject(new Error(errorMessage))
  )
  render(<GenresList fragmentService={fragmentService} />)

  await waitFor(() => {
    expect(screen.getByText('Error loading genres')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})

test('Displays info message when no genres available', async () => {
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve([]))
  render(<GenresList fragmentService={fragmentService} />)

  await waitFor(() => {
    expect(screen.getByText('No genres available.')).toBeInTheDocument()
  })
})
