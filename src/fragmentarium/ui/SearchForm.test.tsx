import React from 'react'
import { Router, withRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import SearchForm from './SearchForm'
import { createMemoryHistory, MemoryHistory } from 'history'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import userEvent from '@testing-library/user-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { FragmentQuery } from 'query/FragmentQuery'
import WordService from 'dictionary/application/WordService'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'
import { Periods } from 'common/period'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('auth/Session')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')

let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let session: jest.Mocked<Session>
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

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

let query: FragmentQuery

let history: MemoryHistory
let searchEntry: BibliographyEntry

async function renderSearchForm() {
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const SearchFormWithRouter = withRouter<any, typeof SearchForm>(SearchForm)
  render(
    <Router history={history}>
      <SessionContext.Provider value={session}>
        <SearchFormWithRouter
          fragmentService={fragmentService}
          fragmentQuery={query}
          fragmentSearchService={fragmentSearchService}
          wordService={wordService}
          history={history}
        />
      </SessionContext.Provider>
    </Router>
  )
}

beforeEach(async () => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()

  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
  searchEntry = bibliographyEntryFactory.build()
  fragmentService.searchBibliography.mockReturnValue(
    Promise.resolve([searchEntry])
  )
  fragmentService.fetchPeriods.mockReturnValue(
    Promise.resolve(Object.keys(Periods))
  )
  fragmentService.fetchGenres.mockReturnValue(Promise.resolve(genres))
  wordService.searchLemma.mockReturnValue(Promise.resolve([word]))
  wordService.findAll.mockReturnValue(Promise.resolve([]))
  session.isAllowedToReadFragments.mockReturnValue(true)
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  await renderSearchForm()
})

describe('User Input', () => {
  it('Displys User Input in NumbersSearchForm', async () => {
    const userInput = 'RN0'
    userEvent.type(screen.getByLabelText('Number'), userInput)
    expect(screen.getByLabelText('Number')).toHaveValue(userInput)
  })

  it('Displays User Input in TranslierationSearchForm', async () => {
    const userInput = 'ma i-ra\nka li'
    userEvent.type(screen.getByLabelText('Transliteration'), userInput)
    await waitFor(() =>
      expect(screen.getByLabelText('Transliteration')).toHaveTextContent(
        userInput.replace(/\n/g, ' ')
      )
    )
  })

  it('Displays User Input in BibliographySelect', async () => {
    const userInput = 'Borger'
    userEvent.type(
      screen.getByLabelText('Select bibliography reference'),
      userInput
    )
    await waitFor(() =>
      expect(
        screen.getByLabelText('Select bibliography reference')
      ).toHaveValue(userInput)
    )
  })
})

describe('Lemma selection form', () => {
  beforeEach(() => {
    userEvent.type(screen.getByLabelText('Select lemmata'), lemmaInput)
  })
  it('displays user input', async () => {
    await waitFor(() =>
      expect(screen.getByLabelText('Select lemmata')).toHaveValue(lemmaInput)
    )
  })

  it('shows options', async () => {
    await waitFor(() => {
      expect(wordService.searchLemma).toHaveBeenCalledWith(lemmaInput)
      expect(screen.getByText('qanû')).toBeVisible()
    })
  })

  it('selects option when clicked', async () => {
    await waitFor(() => {
      expect(wordService.searchLemma).toHaveBeenCalledWith(lemmaInput)
    })
    userEvent.click(screen.getByText('qanû'))
    userEvent.click(screen.getByLabelText('Select lemma query type'))
    userEvent.click(screen.getByText('Exact phrase'))
    userEvent.click(screen.getByText('Search'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith(
        `/fragmentarium/search/?lemmaOperator=phrase&lemmas=${encodeURIComponent(
          'qanû I'
        )}`
      )
    )
  })
})

describe('Script period selection form', () => {
  beforeEach(() => {
    userEvent.type(screen.getByLabelText('select-period'), periodInput)
  })
  it('displays user input', async () => {
    await waitFor(() =>
      expect(screen.getByLabelText('select-period')).toHaveValue(periodInput)
    )
  })

  it('shows options', async () => {
    await waitFor(() => {
      expect(screen.getByText('Old Assyrian')).toBeVisible()
      expect(screen.getByText('Old Babylonian')).toBeVisible()
      expect(screen.getByText('Old Elamite')).toBeVisible()
    })
  })

  it('selects option when clicked', async () => {
    userEvent.click(screen.getByText('Old Assyrian'))
    userEvent.click(screen.getByText('Search'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith(
        '/fragmentarium/search/?scriptPeriod=Old%20Assyrian'
      )
    )
  })

  it('selects period modifier', async () => {
    userEvent.click(screen.getByText('Old Assyrian'))
    userEvent.click(screen.getByLabelText('select-period-modifier'))
    userEvent.click(screen.getByText('Early'))
    userEvent.click(screen.getByText('Search'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith(
        '/fragmentarium/search/?scriptPeriod=Old%20Assyrian&scriptPeriodModifier=Early'
      )
    )
  })
})

describe('Genre selection form', () => {
  beforeEach(() => {
    userEvent.type(screen.getByLabelText('select-genre'), 'arch')
  })
  it('displays user input', async () => {
    await waitFor(() =>
      expect(screen.getByLabelText('select-genre')).toHaveValue('arch')
    )
  })

  it('shows options', async () => {
    await waitFor(() => {
      genres.forEach((genre) => {
        if (genre[0] === 'ARCHIVAL') {
          expect(screen.getByText(genre.join(' ➝ '))).toBeVisible()
        } else {
          expect(screen.queryByText(genre.join(' ➝ '))).not.toBeInTheDocument()
        }
      })
    })
  })

  it('selects option when clicked', async () => {
    userEvent.click(screen.getByText('ARCHIVAL ➝ Administrative'))
    userEvent.click(screen.getByText('Search'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith(
        `/fragmentarium/search/?genre=${encodeURIComponent(
          'ARCHIVAL:Administrative'
        )}`
      )
    )
  })
})

describe('Click Search', () => {
  it('searches transliteration', async () => {
    const transliteration = 'ma i-ra'
    userEvent.type(screen.getByLabelText('Transliteration'), transliteration)
    userEvent.click(screen.getByText('Search'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith(
        '/fragmentarium/search/?transliteration=ma%20i-ra'
      )
    )
  })
})
