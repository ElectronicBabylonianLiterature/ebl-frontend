import React from 'react'
import { act, renderHook, RenderHookResult } from '@testing-library/react'
import {
  Location,
  MemoryRouter,
  NavigationType,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import useSearchTab from 'fragmentarium/ui/search/useSearchTab'

interface SearchTabProbe {
  searchTab: ReturnType<typeof useSearchTab>
  location: Location
  navigationType: NavigationType
}

function renderSearchTab(
  initialEntry: string,
  activeTab: string,
): RenderHookResult<SearchTabProbe, unknown> {
  return renderHook(
    (): SearchTabProbe => ({
      searchTab: useSearchTab(activeTab),
      location: useLocation(),
      navigationType: useNavigationType(),
    }),
    {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      ),
    },
  )
}

describe('useSearchTab', () => {
  it.each([
    ['#corpus', 'library', 'corpus'],
    ['#CORPUS', 'library', 'corpus'],
    ['#library', 'corpus', 'library'],
    ['#unknown', 'corpus', 'library'],
    ['', 'corpus', 'corpus'],
    ['', 'CORPUS', 'corpus'],
    ['', 'library', 'library'],
    ['', '', 'library'],
  ])(
    'selects the tab for hash "%s" with activeTab "%s" as %s',
    (hash, activeTab, expectedTab) => {
      const { result } = renderSearchTab(
        `/library/search/?number=K.1${hash}`,
        activeTab,
      )

      expect(result.current.searchTab.selectedTab).toBe(expectedTab)
    },
  )

  it('pushes the selected tab hash while preserving the path and search', () => {
    const { result } = renderSearchTab(
      '/library/search/?number=K.1&paginationIndex=2#library',
      'library',
    )

    act(() => result.current.searchTab.selectTab('corpus'))

    expect(result.current.location).toMatchObject({
      pathname: '/library/search/',
      search: '?number=K.1&paginationIndex=2',
      hash: '#corpus',
    })
    expect(result.current.navigationType).toBe(NavigationType.Push)
    expect(result.current.searchTab.selectedTab).toBe('corpus')
  })

  it.each([
    ['the already selected tab', 'library'],
    ['a null key', null],
  ])('does not navigate when selecting %s', (_description, selectedKey) => {
    const { result } = renderSearchTab(
      '/library/search/?number=K.1#library',
      'library',
    )
    const initialLocation = result.current.location

    act(() => result.current.searchTab.selectTab(selectedKey))

    expect(result.current.location).toBe(initialLocation)
    expect(result.current.navigationType).toBe(NavigationType.Pop)
    expect(result.current.searchTab.selectedTab).toBe('library')
  })
})
