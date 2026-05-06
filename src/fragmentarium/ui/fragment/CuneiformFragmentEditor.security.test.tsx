import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import { guestSession } from 'auth/Session'
import MemorySession from 'auth/Session'
import { EditorTabs } from 'fragmentarium/ui/fragment/CuneiformFragmentEditor'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import WordService from 'dictionary/application/WordService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')

describe('Security: Fragment View Tabs', () => {
  const mockFragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const mockFragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  const mockWordService = new (WordService as jest.Mock<
    jest.Mocked<WordService>
  >)()
  const mockFindspotService = new (FindspotService as jest.Mock<
    jest.Mocked<FindspotService>
  >)()

  const fragment = fragmentFactory.build({
    atf: '1. ku',
    hasPhoto: true,
  })

  const mockProps = {
    fragment,
    fragmentService: mockFragmentService,
    fragmentSearchService: mockFragmentSearchService,
    wordService: mockWordService,
    findspotService: mockFindspotService,
    onSave: jest.fn(),
    disabled: false,
    activeLine: '',
    onToggle: jest.fn(),
    isColumnVisible: true,
  }

  beforeEach(() => {
    ;(mockWordService.findAll as jest.Mock).mockReturnValue(
      new Promise(() => undefined),
    )
  })

  it('should show display content without tabs for guest users', () => {
    render(
      <MemoryRouter>
        <SessionContext.Provider value={guestSession}>
          <DictionaryContext.Provider value={mockWordService}>
            <EditorTabs {...mockProps} />
          </DictionaryContext.Provider>
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('should show all tabs for authenticated users', () => {
    const authenticatedSession = new MemorySession([
      'read:words',
      'write:words',
      'read:fragments',
      'transliterate:fragments',
      'lemmatize:fragments',
      'annotate:fragments',
      'read:bibliography',
      'write:bibliography',
      'read:texts',
      'write:texts',
    ])

    render(
      <MemoryRouter>
        <SessionContext.Provider value={authenticatedSession}>
          <DictionaryContext.Provider value={mockWordService}>
            <EditorTabs {...mockProps} />
          </DictionaryContext.Provider>
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: /display/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /edition/i })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /lemmatization/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /named entities/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /references/i })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /archaeology/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /colophon/i })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /permissions/i }),
    ).toBeInTheDocument()
  })

  it('should show tabs but disable them based on permissions', () => {
    const readOnlySession = new MemorySession([
      'read:words',
      'read:fragments',
      'read:bibliography',
      'read:texts',
    ])

    render(
      <MemoryRouter>
        <SessionContext.Provider value={readOnlySession}>
          <DictionaryContext.Provider value={mockWordService}>
            <EditorTabs {...mockProps} />
          </DictionaryContext.Provider>
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    const displayTab = screen.getByRole('tab', { name: /display/i })
    expect(displayTab).toBeInTheDocument()
    expect(displayTab).not.toHaveAttribute('aria-disabled', 'true')

    const editionTab = screen.getByRole('tab', { name: /edition/i })
    expect(editionTab).toBeInTheDocument()
    expect(editionTab).toHaveAttribute('aria-disabled', 'true')

    const lemmatizationTab = screen.getByRole('tab', {
      name: /lemmatization/i,
    })
    expect(lemmatizationTab).toBeInTheDocument()
    expect(lemmatizationTab).toHaveAttribute('aria-disabled', 'true')

    const namedEntitiesTab = screen.getByRole('tab', {
      name: /named entities/i,
    })
    expect(namedEntitiesTab).toBeInTheDocument()
    expect(namedEntitiesTab).toHaveAttribute('aria-disabled', 'true')
  })

  it('should verify guest session returns false for all write permissions', () => {
    expect(guestSession.isGuestSession()).toBe(true)
    expect(guestSession.isAllowedToTransliterateFragments()).toBe(false)
    expect(guestSession.isAllowedToLemmatizeFragments()).toBe(false)
    expect(guestSession.isAllowedToAnnotateFragments()).toBe(false)
    expect(guestSession.isAllowedToWriteWords()).toBe(false)
    expect(guestSession.isAllowedToWriteBibliography()).toBe(false)
    expect(guestSession.isAllowedToWriteTexts()).toBe(false)
  })
})
