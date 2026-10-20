import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  bibliographyInput,
  createSearchFormTestContext,
  lemmaInput,
  SearchFormTestContext,
  testInputDisplay,
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

describe('Basic Search', () => {
  describe('User Input', () => {
    it('Displays User Input in NumbersSearchForm', async () => {
      await context.renderSearchForm()
      await testInputDisplay('Number', 'RN0', 'RN0')
    })

    it('Shows feedback on invalid number input in NumbersSearchForm', async () => {
      await context.renderSearchForm()
      await testInputDisplay('Number', '*.*.*', '*.*.*')
      expect(
        screen.getByText(
          'At least one of prefix, number or suffix must be specified.',
        ),
      ).toBeVisible()
    })

    it('Displays User Input in PagesSearchForm', async () => {
      await context.renderSearchForm()
      await testInputDisplay('Pages', '1-2', '1-2')
    })

    it('Displays User Input in TransliterationSearchForm', async () => {
      await context.renderSearchForm()
      await testInputDisplay(
        'Transliteration',
        'ma i-ra\nka li',
        'ma i-ra ka li',
        'textContent',
      )
    })

    it('Displays User Input in BibliographySelect', async () => {
      await context.renderSearchForm()
      await testInputDisplay(
        'Select bibliography reference',
        'Borger',
        'Borger',
      )
    })

    it('Searches transliteration', async () => {
      await context.renderSearchForm()
      await testInputDisplay('Transliteration', 'ma i-ra', 'ma i-ra')
      await userEvent.click(screen.getByText('Search'))
      await context.expectNavigation('?transliteration=ma%20i-ra')
    })
  })

  describe('Lemma Selection Form', () => {
    async function setupLemmaSelection(): Promise<void> {
      await context.renderSearchForm()
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
        expect(context.wordService.searchLemma).toHaveBeenCalledWith(lemmaInput)
      })
      expect(screen.getByText('qanû')).toBeVisible()
    })

    it('Selects option when clicked', async () => {
      await setupLemmaSelection()
      await waitFor(() =>
        expect(context.wordService.searchLemma).toHaveBeenCalledWith(
          lemmaInput,
        ),
      )
      await userEvent.click(screen.getByText('qanû'))
      await userEvent.click(screen.getByLabelText('Select lemma query type'))
      await userEvent.click(screen.getByText('Exact phrase'))
      await userEvent.click(screen.getByText('Search'))
      await context.expectNavigation(
        `?lemmaOperator=phrase&lemmas=${encodeURIComponent('qanû I')}`,
      )
    })
  })

  describe('Bibliography Selection Form', () => {
    it('Loads options', async () => {
      await context.renderSearchForm()
      await userEvent.type(
        screen.getByLabelText('Select bibliography reference'),
        bibliographyInput,
      )
      await waitFor(() =>
        expect(context.fragmentService.searchBibliography).toHaveBeenCalledWith(
          bibliographyInput,
        ),
      )
    })
  })
})
