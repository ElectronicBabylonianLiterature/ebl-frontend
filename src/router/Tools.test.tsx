import { screen } from '@testing-library/react'
import Tools from 'router/Tools'
import MemorySession, { guestSession } from 'auth/Session'
import { renderTools } from 'router/Tools.testSupport'

jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => {
    const { mockHistoryPush } = jest.requireActual(
      'router/Tools.contentMocks.testSupport',
    )
    return { push: mockHistoryPush }
  },
}))

jest.mock('signs/ui/search/Signs', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .SignsMock,
}))

jest.mock('dictionary/ui/search/Dictionary', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .DictionaryMock,
}))

jest.mock('bibliography/ui/BibliographyReferencesContent', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .BibliographyReferencesMock,
}))

jest.mock('afo-register/ui/AfoRegisterSearchPage', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .AfoRegisterMock,
}))

jest.mock('realia/ui/RealiaSearchPage', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .RealiaMock,
}))

jest.mock('dossiers/ui/DossiersSearchPage', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .DossiersMock,
}))

jest.mock('fragmentarium/ui/GenresPage', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .GenresMock,
}))

jest.mock('chronology/ui/DateConverter/DateConverterForm', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .DateConverterFormMock,
  AboutDateConverter: jest.requireActual(
    'router/Tools.contentMocks.testSupport',
  ).AboutDateConverterMock,
}))

jest.mock('chronology/ui/Kings/BrinkmanKingsTable', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .KingsMock,
}))

jest.mock('signs/ui/CuneiformConverter/CuneiformConverterForm', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport')
    .CuneiformConverterMock,
}))

jest.mock('map/MapTab', () => ({
  __esModule: true,
  default: jest.requireActual('router/Tools.contentMocks.testSupport').MapMock,
}))

describe('Tools', () => {
  it('renders tools introduction when no tab is selected', () => {
    renderTools()
    expect(screen.getByText('Welcome to eBL Tools')).toBeInTheDocument()
  })

  it('renders signs content', () => {
    renderTools('signs')
    expect(screen.getByText('Signs Mock')).toBeInTheDocument()
  })

  it('renders references content', () => {
    renderTools('references')
    expect(screen.getByText('Bibliography References Mock')).toBeInTheDocument()
  })

  it('renders afo-register content', () => {
    renderTools('afo-register')
    expect(screen.getByText('AfO-Register Mock')).toBeInTheDocument()
  })

  it('renders realia content', () => {
    renderTools('realia')
    expect(screen.getByText('Realia Mock')).toBeInTheDocument()
  })

  it('shows the Realia nav item when the session has the readRealia scope', () => {
    renderTools(undefined, new MemorySession(['read:realia']))
    expect(screen.getByRole('link', { name: 'Realia' })).toBeInTheDocument()
  })

  it('hides the Realia nav item when the session lacks the readRealia scope', () => {
    renderTools(undefined, guestSession)
    expect(
      screen.queryByRole('link', { name: 'Realia' }),
    ).not.toBeInTheDocument()
  })

  it('renders dossiers content', () => {
    renderTools('dossiers')
    expect(screen.getByText('Dossiers Mock')).toBeInTheDocument()
  })

  it('renders genres content', () => {
    renderTools('genres')
    expect(screen.getByText('Genres Mock')).toBeInTheDocument()
  })

  it('renders date converter content', () => {
    renderTools('date-converter')
    expect(screen.getByText('About Date Converter Mock')).toBeInTheDocument()
    expect(screen.getByText('Date Converter Form Mock')).toBeInTheDocument()
  })

  it('renders kings content', () => {
    renderTools('list-of-kings')
    expect(screen.getByText('Kings Mock')).toBeInTheDocument()
  })

  it('renders cuneiform converter content', () => {
    renderTools('cuneiform-converter')
    expect(screen.getByText('Cuneiform Converter Mock')).toBeInTheDocument()
  })

  it('renders map content', async () => {
    renderTools('map')
    expect(await screen.findByText('Map Mock')).toBeInTheDocument()
  })

  it('renders introduction for unknown activeTab', () => {
    renderTools('unknown-tab' as Parameters<typeof Tools>[0]['activeTab'])
    expect(screen.getByText('Welcome to eBL Tools')).toBeInTheDocument()
  })
})
