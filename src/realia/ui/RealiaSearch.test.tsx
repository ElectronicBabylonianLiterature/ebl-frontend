import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaSearch from 'realia/ui/RealiaSearch'
import RealiaService from 'realia/application/RealiaService'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

jest.mock('realia/application/RealiaService')

const realiaService = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

function renderSearch(query: string): void {
  render(
    <MemoryRouter>
      <RealiaSearch query={query} realiaService={realiaService} />
    </MemoryRouter>,
  )
}

describe('RealiaSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders entries returned by service', async () => {
    const entry = realiaEntryFactory.build()
    realiaService.search.mockReturnValue(Promise.resolve([entry]))
    renderSearch('pig')
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('link', { name: entry.id })).toBeInTheDocument()
  })

  it('shows "No results found." when service returns empty array', async () => {
    realiaService.search.mockReturnValue(Promise.resolve([]))
    renderSearch('pig')
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('does not call service when query is empty', () => {
    renderSearch('')
    expect(realiaService.search).not.toHaveBeenCalled()
  })
})
