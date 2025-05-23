import React from 'react'
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { createMemoryHistory, MemoryHistory } from 'history'
import { FragmentQuery } from 'query/FragmentQuery'
import { Periods } from 'common/period'
import { Router } from 'react-router-dom'
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
let history: MemoryHistory
let searchEntry: BibliographyEntry

async function renderSearchForm(): Promise<void> {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  await act(async () => {
    render(
      <Router history={history}>
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
      </Router>
    )
  })
}

async function expectNavigation(search: string): Promise<void> {
  await waitFor(() =>
    expect(history.push).toHaveBeenCalledWith({
      pathname: '/library/search/',
      search,
    })
  )
}

async function testInputDisplay(
  label: string,
  inputValue: string,
  expectedValue: string,
  valueCheck: 'value' | 'textContent' = 'value'
): Promise<void> {
  userEvent.type(screen.getByLabelText(label), inputValue)
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
  expectedSearch: string
): Promise<void> {
  userEvent.type(screen.getByLabelText(inputLabel), inputValue)
  await act(async () => {
    fireEvent.keyDown(screen.getByLabelText(inputLabel), {
      key: 'Enter',
      code: 'Enter',
      ctrlKey: true,
    })
  })
  await expectNavigation(expectedSearch)
}

async function selectOptionAndSearch(
  optionText: string,
  expectedSearch: string
): Promise<void> {
  userEvent.click(screen.getByText(optionText))
  userEvent.click(screen.getByText('Search'))
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
    Promise.resolve([searchEntry])
  )
  fragmentService.fetchPeriods.mockReturnValue(
    Promise.resolve(Object.keys(Periods))
  )
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve(genres))
  fragmentService.fetchProvenances.mockReturnValue(Promise.resolve(provenances))
  bibliographyService.find.mockReturnValue(Promise.resolve(searchEntry))
  wordService.searchLemma.mockReturnValue(Promise.resolve([word]))
  wordService.findAll.mockReturnValue(Promise.resolve([]))
  session.isAllowedToReadFragments.mockReturnValue(true)
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  await renderSearchForm()
})

describe('Basic Search', () => {
  describe('User Input', () => {
    it('Displays User Input in NumbersSearchForm', async () => {
      await testInputDisplay('Number', 'RN0', 'RN0')
    })

    it('Shows feedback on invalid number input in NumbersSearchForm', async () => {
      await testInputDisplay('Number', '*.*.*', '*.*.*')
      expect(
        screen.getByText(
          'At least one of prefix, number or suffix must be specified.'
        )
      ).toBeVisible()
    })

    it('Displays User Input in PagesSearchForm', async () => {
      await testInputDisplay('Pages', '1-2', '1-2')
    })

    it('Displays User Input in TransliterationSearchForm', async () => {
      await testInputDisplay(
        'Transliteration',
        'ma i-ra\nka li',
        'ma i-ra ka li',
        'textContent'
      )
    })

    it('Displays User Input in BibliographySelect', async () => {
      await testInputDisplay(
        'Select bibliography reference',
        'Borger',
        'Borger'
      )
    })

    it('Searches transliteration', async () => {
      await testInputDisplay('Transliteration', 'ma i-ra', 'ma i-ra')
      userEvent.click(screen.getByText('Search'))
      await expectNavigation('?transliteration=ma%20i-ra')
    })
  })

  describe('Lemma Selection Form', () => {
    beforeEach(() =>
      userEvent.type(screen.getByLabelText('Select lemmata'), lemmaInput)
    )

    it('Displays user input', async () => {
      await waitFor(() =>
        expect(screen.getByLabelText('Select lemmata')).toHaveValue(lemmaInput)
      )
    })

    it('Shows options', async () => {
      await waitFor(() => {
        expect(wordService.searchLemma).toHaveBeenCalledWith(lemmaInput)
        expect(screen.getByText('qanû')).toBeVisible()
      })
    })

    it('Selects option when clicked', async () => {
      await waitFor(() =>
        expect(wordService.searchLemma).toHaveBeenCalledWith(lemmaInput)
      )
      userEvent.click(screen.getByText('qanû'))
      userEvent.click(screen.getByLabelText('Select lemma query type'))
      userEvent.click(screen.getByText('Exact phrase'))
      userEvent.click(screen.getByText('Search'))
      await expectNavigation(
        `?lemmaOperator=phrase&lemmas=${encodeURIComponent('qanû I')}`
      )
    })
  })

  describe('Bibliography Selection Form', () => {
    beforeEach(() =>
      userEvent.type(
        screen.getByLabelText('Select bibliography reference'),
        bibliographyInput
      )
    )

    it('Loads options', async () => {
      await waitFor(() =>
        expect(fragmentService.searchBibliography).toHaveBeenCalledWith(
          bibliographyInput
        )
      )
    })
  })
})

describe('Advanced Search', () => {
  describe('Script Period Selection Form', () => {
    beforeEach(async () => {
      userEvent.type(screen.getByLabelText('select-period'), periodInput)
    })

    it('Displays user input', async () => {
      await waitFor(() =>
        expect(screen.getByLabelText('select-period')).toHaveValue(periodInput)
      )
    })

    it('Shows options', async () => {
      await waitFor(() => {
        expect(screen.getByText('Old Assyrian')).toBeVisible()
        expect(screen.getByText('Old Babylonian')).toBeVisible()
        expect(screen.getByText('Old Elamite')).toBeVisible()
      })
    })

    it('Selects option when clicked', async () => {
      await selectOptionAndSearch(
        'Old Assyrian',
        '?scriptPeriod=Old%20Assyrian'
      )
    })

    it('Selects period modifier', async () => {
      userEvent.click(screen.getByText('Old Assyrian'))
      userEvent.click(screen.getByLabelText('select-period-modifier'))
      userEvent.click(screen.getByText('Early'))
      userEvent.click(screen.getByText('Search'))
      await expectNavigation(
        '?scriptPeriod=Old%20Assyrian&scriptPeriodModifier=Early'
      )
    })
  })

  describe('Provenance Selection Form', () => {
    beforeEach(async () => {
      await waitFor(() => expect(screen.getByText('Provenance')).toBeVisible())
    })

    it('Displays user input', async () => {
      const provenanceInput = await screen.findByLabelText('select-site')
      userEvent.type(provenanceInput, 'Assur')
      await waitFor(() => expect(provenanceInput).toHaveValue('Assur'))
    })

    it('Shows options', async () => {
      const provenanceInput = await screen.findByLabelText('select-site')
      userEvent.type(provenanceInput, 'Assur')
      await waitFor(() => expect(screen.getByText('Aššur')).toBeVisible())
    })

    it('Selects option when clicked', async () => {
      const provenanceInput = await screen.findByLabelText('select-site')
      userEvent.type(provenanceInput, 'Assur')
      await waitFor(() => expect(screen.getByText('Aššur')).toBeVisible())
      userEvent.click(screen.getByText('Aššur'))
      userEvent.click(screen.getByText('Search'))
      await expectNavigation('?site=A%C5%A1%C5%A1ur')
    })
  })

  describe('Genre Selection Form', () => {
    beforeEach(async () => {
      userEvent.type(screen.getByLabelText('select-genre'), 'arch')
    })

    it('Displays user input', async () => {
      await waitFor(() =>
        expect(screen.getByLabelText('select-genre')).toHaveValue('arch')
      )
    })

    it('Shows options', async () => {
      await waitFor(() => {
        genres.forEach((genre) => {
          if (genre[0] === 'ARCHIVAL') {
            expect(screen.getByText(genre.join(' ➝ '))).toBeVisible()
          } else {
            expect(
              screen.queryByText(genre.join(' ➝ '))
            ).not.toBeInTheDocument()
          }
        })
      })
    })

    it('Selects option when clicked', async () => {
      userEvent.click(screen.getByText('ARCHIVAL ➝ Administrative'))
      userEvent.click(screen.getByText('Search'))
      await expectNavigation('?genre=ARCHIVAL%3AAdministrative')
    })
  })
})

describe('Search Form Keyboard Shortcuts', () => {
  it('Triggers search with Ctrl + Enter when form is valid', async () => {
    await testCtrlEnterBehavior(
      'Transliteration',
      'ma i-ra',
      '?transliteration=ma%20i-ra'
    )
  })

  it('Does not trigger search with Ctrl + Enter when form is invalid', async () => {
    await testCtrlEnterBehavior('Number', '[abc]', '?')
  })
})
