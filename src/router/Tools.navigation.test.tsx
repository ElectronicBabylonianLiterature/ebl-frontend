import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tools from 'router/Tools'
import { renderTools, toolsServiceProps } from 'router/Tools.testSupport'

const mockHistoryPush = jest.fn()
jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({ push: mockHistoryPush }),
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

describe('Tools navigation', () => {
  it('updates selected tab when nav item is clicked', async () => {
    renderTools()
    const dictionaryLink = screen.getByRole('link', {
      name: /Akkadian Dictionary/,
    })

    await userEvent.click(dictionaryLink)

    expect(dictionaryLink).toHaveAttribute('href', '/tools/dictionary')
    expect(screen.getByText('Dictionary Mock')).toBeInTheDocument()
  })

  it('keeps current tab active when clicking the already active tab', async () => {
    renderTools('dictionary')
    const dictionaryLink = screen.getByRole('link', {
      name: /Akkadian Dictionary/,
    })

    await userEvent.click(dictionaryLink)

    expect(dictionaryLink).toHaveClass('active')
    expect(screen.getByText('Dictionary Mock')).toBeInTheDocument()
  })

  it('renders nav links to tools routes', () => {
    renderTools('dictionary')

    expect(
      screen.getByRole('link', { name: /Akkadian Dictionary/ }),
    ).toHaveAttribute('href', '/tools/dictionary')
    expect(screen.getByRole('link', { name: /References/ })).toHaveAttribute(
      'href',
      '/tools/references',
    )
    expect(screen.getByRole('link', { name: /Findspot Map/ })).toHaveAttribute(
      'href',
      '/tools/map',
    )
  })

  it('renders nav links in the requested order', () => {
    renderTools()

    const sidebarTitles = screen
      .getAllByRole('link')
      .filter((link) => link.classList.contains('tools-nav__item'))
      .map((link) => link.textContent)

    expect(sidebarTitles).toEqual([
      '𒀀Signs',
      'ꞋAkkadian Dictionary',
      '⚘Realia',
      '⇌Date Converter',
      '♔List of Kings',
      '⊕Genres',
      '⊟Dossiers',
      '※References',
      '⊞AfO-Register',
      '𒐕Cuneiform Converter',
      '◈Findspot Map',
    ])
  })

  it('marks decorative icons as hidden from assistive technologies', () => {
    renderTools('dictionary')

    const navIcons = ['𒀀', 'Ꞌ', '⚘', '⇌', '♔', '⊕', '⊟', '※', '⊞', '𒐕', '◈']

    navIcons.forEach((icon) => {
      expect(
        screen.getByText(icon, { selector: '.tools-nav__icon' }),
      ).toHaveAttribute('aria-hidden', 'true')
    })

    expect(
      screen.getByText('Ꞌ', { selector: '.tools-content__icon' }),
    ).toHaveAttribute('aria-hidden', 'true')
  })

  it('syncs selected tab when activeTab prop changes', () => {
    const { rerender } = renderTools('signs')

    expect(screen.getByText('Signs Mock')).toBeInTheDocument()

    rerender(<Tools {...toolsServiceProps()} activeTab="dictionary" />)

    expect(screen.getByText('Dictionary Mock')).toBeInTheDocument()
  })
})
