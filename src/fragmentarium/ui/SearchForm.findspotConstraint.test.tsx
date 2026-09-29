import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import FindspotConstraint from 'fragmentarium/ui/FindspotConstraint'
import SearchFormWithRouter, {
  SearchForm,
  type SearchFormProps,
} from 'fragmentarium/ui/SearchForm'

function formProps(overrides: Partial<SearchFormProps> = {}): SearchFormProps {
  return {
    fragmentSearchService: {} as FragmentSearchService,
    fragmentService: {} as FragmentService,
    dossiersService: {} as DossiersService,
    bibliographyService: {} as BibliographyService,
    wordService: {} as WordService,
    navigate: jest.fn(),
    ...overrides,
  }
}

function CurrentLocation(): JSX.Element {
  const location = useLocation()
  return (
    <span data-testid="current-location">
      {location.pathname + location.search}
    </span>
  )
}

describe('FindspotConstraint', () => {
  it('makes the active findspot filter visible and clearable', async () => {
    const onClear = jest.fn()
    render(<FindspotConstraint findspotId={0} onClear={onClear} />)

    expect(screen.getByText(/limited to findspot 0/)).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Clear findspot filter' }),
    )

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('stays hidden when no findspot constraint is active', () => {
    render(<FindspotConstraint findspotId={null} onClear={jest.fn()} />)

    expect(
      screen.queryByRole('button', { name: 'Clear findspot filter' }),
    ).not.toBeInTheDocument()
  })

  it('immediately updates the route without the constraint while retaining other filters', async () => {
    render(
      <MemoryRouter
        initialEntries={['/library/search/?findspotId=0&site=Uruk']}
      >
        <SearchFormWithRouter
          {...formProps({ fragmentQuery: { findspotId: 0, site: 'Uruk' } })}
        />
        <CurrentLocation />
      </MemoryRouter>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Clear findspot filter' }),
    )

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/library/search/?site=Uruk',
    )
    expect(
      screen.queryByRole('button', { name: 'Clear findspot filter' }),
    ).not.toBeInTheDocument()
  })

  it('ignores a stale bibliography label after the route changes', async () => {
    let resolveA!: (entry: BibliographyEntry) => void
    let resolveB!: (entry: BibliographyEntry) => void
    const pendingA = new Promise<BibliographyEntry>((resolve) => {
      resolveA = resolve
    })
    const pendingB = new Promise<BibliographyEntry>((resolve) => {
      resolveB = resolve
    })
    const bibliographyService = {
      find: jest.fn((id: string) => (id === 'A' ? pendingA : pendingB)),
    } as unknown as BibliographyService
    const navigate = jest.fn()
    const props = formProps({
      bibliographyService,
      fragmentQuery: { bibId: 'A' },
      navigate,
    })
    const { rerender } = render(
      <MemoryRouter>
        <SearchForm {...props} />
      </MemoryRouter>,
    )
    rerender(
      <MemoryRouter>
        <SearchForm {...props} fragmentQuery={{ bibId: 'B' }} />
      </MemoryRouter>,
    )

    await act(async () => {
      resolveB(new BibliographyEntry({ id: 'B', title: 'Current Label' }))
      await pendingB
      resolveA(new BibliographyEntry({ id: 'A', title: 'Stale Label' }))
      await pendingA
    })
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    const search = navigate.mock.calls.at(-1)?.[0].search as string
    expect(search).toContain('bibId=B')
    expect(search).toContain('Current%20Label')
    expect(search).not.toContain('Stale%20Label')
  })

  it('synchronizes the visible constraint with route query changes', async () => {
    const props = formProps({ fragmentQuery: { findspotId: 7 } })
    const { rerender } = render(
      <MemoryRouter>
        <SearchForm {...props} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/limited to findspot 7/)).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <SearchForm {...props} fragmentQuery={{ findspotId: 8 }} />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/limited to findspot 8/)).toBeInTheDocument()
    expect(screen.queryByText(/limited to findspot 7/)).not.toBeInTheDocument()
  })
})
