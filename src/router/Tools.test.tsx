import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Tools from 'router/Tools'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'

const mockPush = jest.fn()

jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({ push: mockPush }),
}))

jest.mock('signs/ui/search/Signs', () => ({
  __esModule: true,
  default: () => <div>Signs Mock</div>,
}))

jest.mock('dictionary/ui/search/Dictionary', () => ({
  __esModule: true,
  default: () => <div>Dictionary Mock</div>,
}))

jest.mock('bibliography/ui/Bibliography', () => ({
  __esModule: true,
  default: ({ activeTab }: { activeTab: string }) => (
    <div>Bibliography Mock {activeTab}</div>
  ),
}))

jest.mock('chronology/ui/DateConverter/DateConverterForm', () => ({
  __esModule: true,
  default: () => <div>Date Converter Form Mock</div>,
  AboutDateConverter: () => <div>About Date Converter Mock</div>,
}))

jest.mock('chronology/ui/Kings/BrinkmanKingsTable', () => ({
  __esModule: true,
  default: () => <div>Kings Mock</div>,
}))

jest.mock('signs/ui/CuneiformConverter/CuneiformConverterForm', () => ({
  __esModule: true,
  default: () => <div>Cuneiform Converter Mock</div>,
}))

function renderTools(activeTab?: Parameters<typeof Tools>[0]['activeTab']) {
  const props = {
    markupService: {} as MarkupService,
    signService: {} as SignService,
    wordService: {} as WordService,
    bibliographyService: {} as BibliographyService,
    afoRegisterService: {} as AfoRegisterService,
    fragmentService: {} as FragmentService,
    activeTab,
  }

  render(
    <MemoryRouter>
      <Tools {...props} />
    </MemoryRouter>,
  )
}

describe('Tools', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  it('renders tools introduction when no tab is selected', () => {
    renderTools()
    expect(screen.getByText('Welcome to eBL Tools')).toBeInTheDocument()
  })

  it('renders signs content', () => {
    renderTools('signs')
    expect(screen.getByText('Signs Mock')).toBeInTheDocument()
  })

  it('renders bibliography references content', () => {
    renderTools('bibliography')
    expect(screen.getByText('Bibliography Mock references')).toBeInTheDocument()
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

  it('renders introduction for unknown activeTab', () => {
    renderTools('unknown-tab' as Parameters<typeof Tools>[0]['activeTab'])
    expect(screen.getByText('Welcome to eBL Tools')).toBeInTheDocument()
  })

  it('updates selected tab and pushes route when nav item is clicked', async () => {
    renderTools()
    await userEvent.click(screen.getByRole('button', { name: /Dictionary/ }))
    expect(mockPush).toHaveBeenCalledWith('/tools/dictionary')
  })

  it('does not push route when clicking the already active tab', async () => {
    renderTools('dictionary')
    await userEvent.click(screen.getByRole('button', { name: /Dictionary/ }))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('syncs selected tab when activeTab prop changes', () => {
    const props = {
      markupService: {} as MarkupService,
      signService: {} as SignService,
      wordService: {} as WordService,
      bibliographyService: {} as BibliographyService,
      afoRegisterService: {} as AfoRegisterService,
      fragmentService: {} as FragmentService,
      activeTab: 'signs' as Parameters<typeof Tools>[0]['activeTab'],
    }

    const { rerender } = render(
      <MemoryRouter>
        <Tools {...props} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Signs Mock')).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <Tools {...props} activeTab="dictionary" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Dictionary Mock')).toBeInTheDocument()
  })

  it('scrolls to element from hash location', () => {
    jest.useFakeTimers()
    const scrollIntoView = jest.fn()
    const getElementByIdSpy = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue({
        scrollIntoView,
      } as unknown as HTMLElement)

    render(
      <MemoryRouter initialEntries={['/tools#target-section']}>
        <Tools
          markupService={{} as MarkupService}
          signService={{} as SignService}
          wordService={{} as WordService}
          bibliographyService={{} as BibliographyService}
          afoRegisterService={{} as AfoRegisterService}
          fragmentService={{} as FragmentService}
        />
      </MemoryRouter>,
    )

    jest.runAllTimers()
    expect(getElementByIdSpy).toHaveBeenCalledWith('target-section')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

    getElementByIdSpy.mockRestore()
    jest.useRealTimers()
  })
})
