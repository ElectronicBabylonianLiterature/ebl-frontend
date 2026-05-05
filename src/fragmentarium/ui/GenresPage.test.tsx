import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import GenresPage from 'fragmentarium/ui/GenresPage'
import FragmentService from 'fragmentarium/application/FragmentService'
import Bluebird from 'bluebird'

jest.mock('common/ui/Markdown', () => ({
  __esModule: true,
  Markdown: ({ text }: { text: string }) => <div>{text}</div>,
}))

const mockGenres: string[][] = [
  ['ARCHIVAL'],
  ['ARCHIVAL', 'Administrative'],
  ['ARCHIVAL', 'Memos'],
  ['CANONICAL'],
  ['CANONICAL', 'Hymns'],
  ['SCIENTIFIC'],
]

function makeFragmentService(genres = mockGenres): FragmentService {
  return {
    fetchGenres: jest.fn().mockReturnValue(Bluebird.resolve(genres)),
  } as unknown as FragmentService
}

describe('GenresPage', () => {
  it('renders introduction text', async () => {
    const fragmentService = makeFragmentService()
    render(<GenresPage fragmentService={fragmentService} />)
    expect(
      await screen.findByText(/genre taxonomy was initially developed/),
    ).toBeInTheDocument()
  })

  it('renders top-level genre categories as headings', async () => {
    const fragmentService = makeFragmentService()
    render(<GenresPage fragmentService={fragmentService} />)
    expect(
      await screen.findByRole('heading', { name: 'ARCHIVAL' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'CANONICAL' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'SCIENTIFIC' }),
    ).toBeInTheDocument()
  })

  it('renders sub-categories', async () => {
    const fragmentService = makeFragmentService()
    render(<GenresPage fragmentService={fragmentService} />)
    expect(await screen.findByText('Administrative')).toBeInTheDocument()
    expect(screen.getByText('Memos')).toBeInTheDocument()
    expect(screen.getByText('Hymns')).toBeInTheDocument()
  })

  it('only creates sub-category lists for categories that have sub-items', async () => {
    const fragmentService = makeFragmentService()
    render(<GenresPage fragmentService={fragmentService} />)
    await screen.findByRole('heading', { name: 'ARCHIVAL' })
    expect(screen.getAllByRole('list')).toHaveLength(2)
  })

  it('renders the correct number of list items across all categories', async () => {
    const fragmentService = makeFragmentService()
    render(<GenresPage fragmentService={fragmentService} />)
    await screen.findByRole('heading', { name: 'ARCHIVAL' })
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders an empty genre tree when no genres are returned', async () => {
    const fragmentService = makeFragmentService([])
    render(<GenresPage fragmentService={fragmentService} />)
    expect(
      await screen.findByText(/genre taxonomy was initially developed/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument()
  })

  it('fetches genres on mount', async () => {
    const fragmentService = makeFragmentService()
    render(<GenresPage fragmentService={fragmentService} />)
    await screen.findByRole('heading', { name: 'ARCHIVAL' })
    expect(fragmentService.fetchGenres).toHaveBeenCalledTimes(1)
  })
})
