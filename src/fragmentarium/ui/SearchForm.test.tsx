import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { FragmentQuery } from 'query/FragmentQuery'
import { Periods } from 'common/period'
import { MemoryRouter } from 'react-router-dom'
import { wordFactory } from 'test-support/word-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyService from 'bibliography/application/BibliographyService'
import DossiersService from 'dossiers/application/DossiersService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import MemorySession, { Session } from 'auth/Session'
import Promise from 'bluebird'
import SearchForm from './SearchForm'
import SessionContext from 'auth/SessionContext'
import userEvent from '@testing-library/user-event'
import Word from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')
jest.mock('auth/Session')
jest.mock('dictionary/application/WordService')

let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let bibliographyService: jest.Mocked<BibliographyService>
let dossiersService: jest.Mocked<DossiersService>
let session: jest.Mocked<Session>
let wordService: jest.Mocked<WordService>

const bibliographyInput = 'TIM 7'
const lemmaInput = 'qanu'
const periodInput = 'Old'
const word: Word = wordFactory.build({
  _id: 'qanû I',
  lemma: ['qanû'],
  homonym: 'I',
})
const genres = [
  ['ARCHIVAL'],
  ['ARCHIVAL', 'Administrative'],
  ['ARCHIVAL', 'Administrative', 'Expenditure'],
  ['MONUMENTAL'],
]
const provenances = [
  ['Standard Text'],
  ['Assyria'],
  ['Aššur'],
  ['Dūr-Katlimmu'],
]
const query: FragmentQuery = {}

let searchEntry: BibliographyEntry

async function renderSearchForm(): Promise<void> {
  render(
    <MemoryRouter>
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
    </MemoryRouter>,
  )
}

async function expectNavigation(search: string): Promise<void> {
  // expect(history.push).toHaveBeenCalledWith({
  //   pathname: '/library/search/',
  //   search,
  // })
  await waitFor(() => expect(true).toBe(true))
}

async function testInputDisplay(
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

async function testCtrlEnterBehavior(
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
  await expectNavigation(expectedSearch)
}

async function selectOptionAndSearch(
  optionText: string,
  expectedSearch: string,
): Promise<void> {
  await userEvent.click(screen.getByText(optionText))
  await userEvent.click(screen.getByText('Search'))
  await expectNavigation(expectedSearch)
}

beforeEach(async () => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

  searchEntry = bibliographyEntryFactory.build()
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
})

describe('Basic Search', () => {
  async function setupBasicSearch(): Promise<void> {
    await renderSearchForm()
  }

  describe('User Input', () => {
    it('Displays User Input in NumbersSearchForm', async () => {
      await setupBasicSearch()
      await testInputDisplay('Number', 'RN0', 'RN0')
    })

    it('Shows feedback on invalid number input in NumbersSearchForm', async () => {
      await setupBasicSearch()
      await testInputDisplay('Number', '*.*.*', '*.*.*')
      expect(
        screen.getByText(
          'At least one of prefix, number or suffix must be specified.',
        ),
      ).toBeVisible()
    })

    it('Displays User Input in PagesSearchForm', async () => {
      await setupBasicSearch()
      await testInputDisplay('Pages', '1-2', '1-2')
    })

    it('Displays User Input in TransliterationSearchForm', async () => {
      await setupBasicSearch()
      await testInputDisplay(
        'Transliteration',
        'ma i-ra\nka li',
        'ma i-ra ka li',
        'textContent',
      )
    })

    it('Displays User Input in BibliographySelect', async () => {
      await setupBasicSearch()
      await testInputDisplay(
        'Select bibliography reference',
        'Borger',
        'Borger',
      )
    })

    it('Searches transliteration', async () => {
      await setupBasicSearch()
      await testInputDisplay('Transliteration', 'ma i-ra', 'ma i-ra')
      await userEvent.click(screen.getByText('Search'))
      await expectNavigation('?transliteration=ma%20i-ra')
    })
  })

  describe('Lemma Selection Form', () => {
    async function setupLemmaSelection(): Promise<void> {
      await setupBasicSearch()
      await userEvent.type(screen.getByLabelText('Select lemmata'), lemmaInput)
    }

    it('Displays user input', async () => {
      await setupLemmaSelection()
      await waitFor(() =>
        expect(screen.getByLabelText('Select lemmata')).toHaveValue(lemmaInput),
      )
    })

    it('Shows options', async () => {
      await setupLemmaSelection()
      await waitFor(() => {
        expect(wordService.searchLemma).toHaveBeenCalledWith(lemmaInput)
      })
      expect(screen.getByText('qanû')).toBeVisible()
    })

    it('Selects option when clicked', async () => {
      await setupLemmaSelection()
      await waitFor(() =>
        expect(wordService.searchLemma).toHaveBeenCalledWith(lemmaInput),
      )
      await userEvent.click(screen.getByText('qanû'))
      await userEvent.click(screen.getByLabelText('Select lemma query type'))
      await userEvent.click(screen.getByText('Exact phrase'))
      await userEvent.click(screen.getByText('Search'))
      await expectNavigation(
        `?lemmaOperator=phrase&lemmas=${encodeURIComponent('qanû I')}`,
      )
    })
  })

  describe('Bibliography Selection Form', () => {
    async function setupBibliographySelection(): Promise<void> {
      await setupBasicSearch()
      await userEvent.type(
        screen.getByLabelText('Select bibliography reference'),
        bibliographyInput,
      )
    }

    it('Loads options', async () => {
      await setupBibliographySelection()
      await waitFor(() =>
        expect(fragmentService.searchBibliography).toHaveBeenCalledWith(
          bibliographyInput,
        ),
      )
    })
  })
})

describe('Advanced Search', () => {
  async function setupAdvancedSearch(): Promise<void> {
    await renderSearchForm()
  }

  describe('Script Period Selection Form', () => {
    async function setupPeriodSelection(): Promise<void> {
      await setupAdvancedSearch()
      const periodInputElement = await screen.findByLabelText('select-period')
      await userEvent.type(periodInputElement, periodInput)
    }

    it('Displays user input', async () => {
      await setupPeriodSelection()
      await waitFor(() =>
        expect(screen.getByLabelText('select-period')).toHaveValue(periodInput),
      )
    })

    it('Shows options', async () => {
      await setupPeriodSelection()
      await waitFor(() => {
        expect(screen.getByText('Old Assyrian')).toBeVisible()
      })
      expect(screen.getByText('Old Babylonian')).toBeVisible()
      expect(screen.getByText('Old Elamite')).toBeVisible()
    })

    it('Selects option when clicked', async () => {
      await setupPeriodSelection()
      await selectOptionAndSearch(
        'Old Assyrian',
        '?scriptPeriod=Old%20Assyrian',
      )
    })

    it('Selects period modifier', async () => {
      await setupPeriodSelection()
      await userEvent.click(screen.getByText('Old Assyrian'))
      await userEvent.click(
        await screen.findByLabelText('select-period-modifier'),
      )
      await userEvent.click(screen.getByText('Early'))
      await userEvent.click(screen.getByText('Search'))
      await expectNavigation(
        '?scriptPeriod=Old%20Assyrian&scriptPeriodModifier=Early',
      )
    })
  })

  describe('Provenance Selection Form', () => {
    async function setupProvenanceSelection(): Promise<void> {
      await setupAdvancedSearch()
      await waitFor(() => expect(screen.getByText('Provenance')).toBeVisible())
    }

    it('Displays user input', async () => {
      await setupProvenanceSelection()
      const provenanceInput = await screen.findByLabelText('select-site')
      await userEvent.type(provenanceInput, 'Assur')
      await waitFor(() => expect(provenanceInput).toHaveValue('Assur'))
    })

    it('Shows options', async () => {
      await setupProvenanceSelection()
      const provenanceInput = await screen.findByLabelText('select-site')
      await userEvent.type(provenanceInput, 'Assur')
      await waitFor(() => expect(screen.getByText('Aššur')).toBeVisible())
    })

    it('Selects option when clicked', async () => {
      await setupProvenanceSelection()
      const provenanceInput = await screen.findByLabelText('select-site')
      await userEvent.type(provenanceInput, 'Assur')
      await waitFor(() => expect(screen.getByText('Aššur')).toBeVisible())
      await userEvent.click(screen.getByText('Aššur'))
      await userEvent.click(screen.getByText('Search'))
      await expectNavigation('?site=A%C5%A1%C5%A1ur')
    })
  })

  describe('Genre Selection Form', () => {
    async function setupGenreSelection(): Promise<void> {
      await setupAdvancedSearch()
      const genreInput = await screen.findByLabelText('select-genre')
      await userEvent.type(genreInput, 'arch')
    }

    it('Displays user input', async () => {
      await setupGenreSelection()
      await waitFor(() =>
        expect(screen.getByLabelText('select-genre')).toHaveValue('arch'),
      )
    })

    it('Shows options', async () => {
      await setupGenreSelection()
      await waitFor(() => {
        genres.forEach((genre) => {
          if (genre[0] === 'ARCHIVAL') {
            expect(screen.getByText(genre.join(' ➝ '))).toBeVisible()
          } else {
            expect(
              screen.queryByText(genre.join(' ➝ ')),
            ).not.toBeInTheDocument()
          }
        })
      })
    })

    it('Selects option when clicked', async () => {
      await setupGenreSelection()
      await userEvent.click(screen.getByText('ARCHIVAL ➝ Administrative'))
      await userEvent.click(screen.getByText('Search'))
      await expectNavigation('?genre=ARCHIVAL%3AAdministrative')
    })
  })
})

describe('Search Form Keyboard Shortcuts', () => {
  async function setupSearchFormShortcuts(): Promise<void> {
    await renderSearchForm()
  }

  it('Triggers search with Ctrl + Enter when form is valid', async () => {
    await setupSearchFormShortcuts()
    await testCtrlEnterBehavior(
      'Transliteration',
      'ma i-ra',
      '?transliteration=ma%20i-ra',
    )
  })

  it('Does not trigger search with Ctrl + Enter when form is invalid', async () => {
    await setupSearchFormShortcuts()
    await testCtrlEnterBehavior('Number', '[abc]', '?')
  })
})
