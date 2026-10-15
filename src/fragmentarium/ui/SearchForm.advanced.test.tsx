import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createSearchFormTestContext,
  genres,
  periodInput,
  SearchFormTestContext,
  selectOptionAndSearch,
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

describe('Advanced Search', () => {
  describe('Script Period Selection Form', () => {
    async function setupPeriodSelection(): Promise<void> {
      await context.renderSearchForm()
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
        context,
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
      await context.expectNavigation(
        '?scriptPeriod=Old%20Assyrian&scriptPeriodModifier=Early',
      )
    })
  })

  describe('Provenance Selection Form', () => {
    async function setupProvenanceSelection(): Promise<HTMLElement> {
      await context.renderSearchForm()
      await waitFor(() => expect(screen.getByText('Provenance')).toBeVisible())
      return screen.findByLabelText('select-site')
    }

    it('Displays user input', async () => {
      const provenanceInput = await setupProvenanceSelection()
      await userEvent.type(provenanceInput, 'Assur')
      await waitFor(() => expect(provenanceInput).toHaveValue('Assur'))
    })

    it('Shows options', async () => {
      const provenanceInput = await setupProvenanceSelection()
      await userEvent.type(provenanceInput, 'Assur')
      await waitFor(() =>
        expect(screen.getByText('Aššur [Assyria]')).toBeVisible(),
      )
    })

    it('Selects option when clicked', async () => {
      const provenanceInput = await setupProvenanceSelection()
      await userEvent.type(provenanceInput, 'Assur')
      await waitFor(() =>
        expect(screen.getByText('Aššur [Assyria]')).toBeVisible(),
      )
      await userEvent.click(screen.getByText('Aššur [Assyria]'))
      await userEvent.click(screen.getByText('Search'))
      await context.expectNavigation('?site=A%C5%A1%C5%A1ur')
    })
  })

  describe('Genre Selection Form', () => {
    async function setupGenreSelection(): Promise<void> {
      await context.renderSearchForm()
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
      await context.expectNavigation('?genre=ARCHIVAL%3AAdministrative')
    })
  })
})
