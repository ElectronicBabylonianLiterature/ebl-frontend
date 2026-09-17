import {
  createSearchFormTestContext,
  SearchFormTestContext,
  testCtrlEnterBehavior,
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

describe('Search Form Keyboard Shortcuts', () => {
  it('Triggers search with Ctrl + Enter when form is valid', async () => {
    await context.renderSearchForm()
    await testCtrlEnterBehavior(
      context,
      'Transliteration',
      'ma i-ra',
      '?transliteration=ma%20i-ra',
    )
  })

  it('Does not trigger search with Ctrl + Enter when form is invalid', async () => {
    await context.renderSearchForm()
    await testCtrlEnterBehavior(context, 'Number', '[abc]', '?')
  })
})
