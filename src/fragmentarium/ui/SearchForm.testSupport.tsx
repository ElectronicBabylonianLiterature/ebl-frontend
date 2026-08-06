import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { FragmentQuery } from 'query/FragmentQuery'
import { Periods } from 'common/utils/period'
import { MemoryRouter } from 'react-router-dom'
import { wordFactory } from 'test-support/word-fixtures'
import BibliographyService from 'bibliography/application/BibliographyService'
import DossiersService from 'dossiers/application/DossiersService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import MemorySession, { Session } from 'auth/Session'
import SearchForm from 'fragmentarium/ui/SearchForm'
import SessionContext from 'auth/SessionContext'
import userEvent from '@testing-library/user-event'
import Word from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'

export const bibliographyInput = 'TIM 7'
export const lemmaInput = 'qanu'
export const periodInput = 'Old'

export const word: Word = wordFactory.build({
  _id: 'qanû I',
  lemma: ['qanû'],
  homonym: 'I',
})

export const genres = [
  ['ARCHIVAL'],
  ['ARCHIVAL', 'Administrative'],
  ['ARCHIVAL', 'Administrative', 'Expenditure'],
  ['MONUMENTAL'],
]

export const provenances = [
  {
    id: 'standard-text',
    longName: 'Standard Text',
    abbreviation: 'Std',
    parent: null,
    sortKey: 1,
  },
  {
    id: 'assyria',
    longName: 'Assyria',
    abbreviation: 'Assa',
    parent: null,
    sortKey: 2,
  },
  {
    id: 'assur',
    longName: 'Aššur',
    abbreviation: 'Ašš',
    parent: 'Assyria',
    sortKey: 3,
  },
  {
    id: 'dur-katlimmu',
    longName: 'Dūr-Katlimmu',
    abbreviation: 'Dka',
    parent: 'Assyria',
    sortKey: 4,
  },
]

const query: FragmentQuery = {}

export function TestMemoryRouter({
  children,
  ...props
}: React.PropsWithChildren<Record<string, unknown>>): JSX.Element {
  return (
    <MemoryRouter
      {...props}
      future={Object.fromEntries([
        ['v7_startTransition', true],
        ['v7_relativeSplatPath', true],
      ])}
    >
      {children}
    </MemoryRouter>
  )
}

export interface SearchFormTestContext {
  fragmentService: jest.Mocked<FragmentService>
  wordService: jest.Mocked<WordService>
  renderSearchForm: () => Promise<void>
  expectNavigation: (search: string) => Promise<void>
}

export function createSearchFormTestContext(
  mockNavigate: jest.Mock,
): SearchFormTestContext {
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  const bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  const session = new (MemorySession as jest.Mock<
    jest.Mocked<MemorySession>
  >)() as jest.Mocked<Session>
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

  const searchEntry = bibliographyEntryFactory.build()
  fragmentService.searchBibliography.mockReturnValue(
    Promise.resolve([searchEntry]),
  )
  fragmentService.fetchPeriods.mockReturnValue(
    Promise.resolve(Object.keys(Periods)),
  )
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve(genres))
  fragmentService.fetchProvenances.mockReturnValue(Promise.resolve(provenances))
  dossiersService.fetchAllDossiers.mockReturnValue(Promise.resolve([]))
  dossiersService.fetchFilteredDossiers.mockReturnValue(Promise.resolve([]))
  bibliographyService.find.mockReturnValue(Promise.resolve(searchEntry))
  wordService.searchLemma.mockReturnValue(Promise.resolve([word]))
  wordService.findAll.mockReturnValue(Promise.resolve([]))
  session.isAllowedToReadFragments.mockReturnValue(true)
  session.isAllowedToTransliterateFragments.mockReturnValue(true)

  return {
    fragmentService: fragmentService,
    wordService: wordService,
    renderSearchForm: async (): Promise<void> => {
      render(
        <TestMemoryRouter>
          <SessionContext.Provider value={session}>
            <SearchForm
              fragmentService={fragmentService}
              fragmentQuery={query}
              fragmentSearchService={fragmentSearchService}
              bibliographyService={bibliographyService}
              dossiersService={dossiersService}
              wordService={wordService}
              showAdvancedSearch={true}
            />
          </SessionContext.Provider>
        </TestMemoryRouter>,
      )
      await screen.findByText('Genre')
    },
    expectNavigation: async (search: string): Promise<void> => {
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: expect.stringContaining('/search/'),
            search,
          }),
        ),
      )
    },
  }
}

export async function testInputDisplay(
  label: string,
  inputValue: string,
  expectedValue: string,
  valueCheck: 'value' | 'textContent' = 'value',
): Promise<void> {
  await userEvent.type(screen.getByLabelText(label), inputValue)
  await waitFor(() => {
    const element = screen.getByLabelText(label)
    if (valueCheck === 'value') {
      expect(element).toHaveValue(expectedValue)
    } else {
      expect(element).toHaveTextContent(expectedValue)
    }
  })
}

export async function testCtrlEnterBehavior(
  context: SearchFormTestContext,
  inputLabel: string,
  inputValue: string,
  expectedSearch: string,
): Promise<void> {
  await userEvent.type(screen.getByLabelText(inputLabel), inputValue)
  fireEvent.keyDown(screen.getByLabelText(inputLabel), {
    key: 'Enter',
    code: 'Enter',
    ctrlKey: true,
  })
  await context.expectNavigation(expectedSearch)
}

export async function selectOptionAndSearch(
  context: SearchFormTestContext,
  optionText: string,
  expectedSearch: string,
): Promise<void> {
  await userEvent.click(screen.getByText(optionText))
  await userEvent.click(screen.getByText('Search'))
  await context.expectNavigation(expectedSearch)
}
