/**
 * Security test for Fragment View tabs
 * Ensures unauthenticated users cannot see protected tabs
 */

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

  it('should only show display tab for guest users', () => {
    render(
      <MemoryRouter>
        <SessionContext.Provider value={guestSession}>
          <EditorTabs {...mockProps} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    // Guest users should only see "Display" tab
    expect(screen.getByRole('tab', { name: /display/i })).toBeInTheDocument()

    // These tabs should NOT be visible to guests
    expect(
      screen.queryByRole('tab', { name: /edition/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /lemmatization/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /named entities/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /references/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /archaeology/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /colophon/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /permissions/i }),
    ).not.toBeInTheDocument()
  })

  it('should show all tabs for authenticated users', () => {
    // Create authenticated session with all permissions
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
          <EditorTabs {...mockProps} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    // Authenticated users should see all tabs
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
    // Create session with only read permissions (no write permissions)
    const readOnlySession = new MemorySession([
      'read:words',
      'read:fragments',
      'read:bibliography',
      'read:texts',
    ])

    render(
      <MemoryRouter>
        <SessionContext.Provider value={readOnlySession}>
          <EditorTabs {...mockProps} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    // Display tab should be enabled
    const displayTab = screen.getByRole('tab', { name: /display/i })
    expect(displayTab).toBeInTheDocument()
    expect(displayTab).not.toHaveAttribute('aria-disabled', 'true')

    // Edition tab should be disabled (requires transliterate:fragments)
    const editionTab = screen.getByRole('tab', { name: /edition/i })
    expect(editionTab).toBeInTheDocument()
    expect(editionTab).toHaveAttribute('aria-disabled', 'true')

    // Lemmatization tab should be disabled (requires lemmatize:fragments)
    const lemmatizationTab = screen.getByRole('tab', {
      name: /lemmatization/i,
    })
    expect(lemmatizationTab).toBeInTheDocument()
    expect(lemmatizationTab).toHaveAttribute('aria-disabled', 'true')

    // Named entities should be disabled (requires annotate:fragments)
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
