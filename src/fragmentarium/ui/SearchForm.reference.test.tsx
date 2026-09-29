import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import { stringify } from 'query-string'
import BibliographyService from 'bibliography/application/BibliographyService'
import DossiersService from 'dossiers/application/DossiersService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import SearchForm from 'fragmentarium/ui/SearchForm'
import { TestMemoryRouter } from 'fragmentarium/ui/SearchForm.testSupport'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

const entry = bibliographyEntryFactory.build()

async function renderSearchForm(): Promise<void> {
  const bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  bibliographyService.find.mockResolvedValue(entry)
  fragmentService.searchBibliography.mockResolvedValue([entry])
  render(
    <TestMemoryRouter>
      <SearchForm
        fragmentService={fragmentService}
        fragmentQuery={{ bibId: entry.id }}
        fragmentSearchService={new (FragmentSearchService as jest.Mock)()}
        bibliographyService={bibliographyService}
        dossiersService={new (DossiersService as jest.Mock)()}
        wordService={new (WordService as jest.Mock)()}
      />
    </TestMemoryRouter>,
  )
  await screen.findByText(entry.label)
}

beforeEach(() => mockNavigate.mockClear())

it('fetches the label of the queried reference', async () => {
  await renderSearchForm()
  await userEvent.click(screen.getByText('Search'))

  expect(mockNavigate).toHaveBeenCalledWith({
    pathname: '/library/search/',
    search: `?${stringify({ bibId: entry.id, label: entry.label })}`,
  })
})

it('clears the selected reference', async () => {
  await renderSearchForm()
  await selectEvent.clearFirst(
    screen.getByLabelText('Select bibliography reference'),
  )
  await userEvent.click(screen.getByText('Search'))

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/library/search/',
      search: `?${stringify({ label: new BibliographyEntry().label })}`,
    }),
  )
})
