import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { stringify } from 'common/utils/queryString'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import {
  createSearchFormTestContext,
  SearchFormTestContext,
} from 'fragmentarium/ui/SearchForm.testSupport'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')
jest.mock('auth/Session')
jest.mock('dictionary/application/WordService')

let context: SearchFormTestContext

beforeEach(() => {
  mockNavigate.mockClear()
  context = createSearchFormTestContext(mockNavigate)
})

describe('Reference from the query', () => {
  it('Fetches the label when only the reference id is given', async () => {
    const entry = bibliographyEntryFactory.build()
    context.bibliographyService.find.mockResolvedValue(entry)
    await context.renderSearchForm({ bibId: entry.id })
    expect(await screen.findByTitle(entry.label)).toBeVisible()
    expect(context.bibliographyService.find).toHaveBeenCalledWith(entry.id)
  })

  it('Uses the given label without fetching', async () => {
    await context.renderSearchForm({ bibId: 'RN1', bibLabel: 'Given Label' })
    expect(screen.getByTitle('Given Label')).toBeVisible()
    expect(context.bibliographyService.find).not.toHaveBeenCalled()
  })
})

describe('Selecting a reference', () => {
  it('Searches the selected reference', async () => {
    const entry = bibliographyEntryFactory.build()
    context.fragmentService.searchBibliography.mockResolvedValue([entry])
    await context.renderSearchForm()
    await userEvent.type(
      screen.getByLabelText('Select bibliography reference'),
      'Borger',
    )
    await userEvent.click(await screen.findByText(entry.label))
    await userEvent.click(screen.getByText('Search'))
    await context.expectNavigation(
      `?${stringify({ bibId: entry.id, label: entry.label })}`,
    )
  })
})

describe('Clearing a filter', () => {
  it('Omits a cleared provenance from the search', async () => {
    await context.renderSearchForm()
    const provenanceInput = await screen.findByLabelText('select-site')
    await userEvent.type(provenanceInput, 'Assur')
    await userEvent.click(await screen.findByText('Aššur [Assyria]'))
    await userEvent.type(provenanceInput, '{backspace}')
    await waitFor(() =>
      expect(screen.queryByText('Aššur')).not.toBeInTheDocument(),
    )
    await userEvent.click(screen.getByText('Search'))
    await context.expectNavigation('?')
  })
})

describe('Dossier suggestions', () => {
  it('Requests suggestions with the selected filters', async () => {
    await context.renderSearchForm()
    await userEvent.type(screen.getByLabelText('Dossier'), 'D')
    await waitFor(() =>
      expect(context.dossiersService.searchSuggestions).toHaveBeenCalledWith(
        'D',
        { provenance: '', scriptPeriod: '', genre: '' },
      ),
    )
  })
})
