import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tools from 'router/Tools'
import { renderTools, toolsServiceProps } from 'router/Tools.testSupport'
import {
  expectToolsContentPagesMocked,
  type ToolsContentMockName,
} from 'router/Tools.contentMocks.testSupport'

const mockHistoryPush = jest.fn()
jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({ push: mockHistoryPush }),
}))

function mockToolsContent(name: ToolsContentMockName): unknown {
  return jest
    .requireActual('router/Tools.contentMocks.testSupport')
    .toolsContentMock(name)
}

jest.mock('signs/ui/search/Signs', () => mockToolsContent('signs'))
jest.mock('dictionary/ui/search/Dictionary', () =>
  mockToolsContent('dictionary'),
)
jest.mock('bibliography/ui/BibliographyReferencesContent', () =>
  mockToolsContent('references'),
)
jest.mock('afo-register/ui/AfoRegisterSearchPage', () =>
  mockToolsContent('afoRegister'),
)
jest.mock('realia/ui/RealiaSearchPage', () => mockToolsContent('realia'))
jest.mock('dossiers/ui/DossiersSearchPage', () => mockToolsContent('dossiers'))
jest.mock('fragmentarium/ui/GenresPage', () => mockToolsContent('genres'))
jest.mock('chronology/ui/DateConverter/DateConverterForm', () =>
  mockToolsContent('dateConverter'),
)
jest.mock('chronology/ui/Kings/BrinkmanKingsTable', () =>
  mockToolsContent('kings'),
)
jest.mock('signs/ui/CuneiformConverter/CuneiformConverterForm', () =>
  mockToolsContent('cuneiformConverter'),
)
jest.mock('map/MapTab', () => mockToolsContent('map'))

describe('Tools navigation', () => {
  it('stubs every tools content page', expectToolsContentPagesMocked)

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
