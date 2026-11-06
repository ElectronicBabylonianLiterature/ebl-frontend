import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BibliographyService from 'bibliography/application/BibliographyService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { SearchForm, type SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { searchFormProps } from 'fragmentarium/ui/SearchForm.props.testSupport'

function renderForm(props: SearchFormProps): JSX.Element {
  return (
    <MemoryRouter>
      <SearchForm {...props} />
    </MemoryRouter>
  )
}

function pendingReference(): {
  promise: Promise<BibliographyEntry>
  resolve: (entry: BibliographyEntry) => void
  reject: (error: Error) => void
} {
  let resolve!: (entry: BibliographyEntry) => void
  let reject!: (error: Error) => void
  const promise = new Promise<BibliographyEntry>(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise
      reject = rejectPromise
    },
  )
  return { promise, resolve, reject }
}

function finishStaleLookup(
  pending: ReturnType<typeof pendingReference>,
  outcome: 'resolve' | 'reject',
): void {
  if (outcome === 'resolve') {
    pending.resolve(
      new BibliographyEntry({ id: 'missing', title: 'Stale label' }),
    )
  } else {
    pending.reject(new Error('Stale lookup failed'))
  }
}

function propsFor(
  find: (id: string) => Promise<BibliographyEntry>,
): SearchFormProps {
  return searchFormProps({
    bibliographyService: { find } as BibliographyService,
    fragmentQuery: { bibId: 'missing', findspotId: 7, site: 'Uruk' },
  })
}

describe('bibliography label failures', () => {
  it('announces a failed initial lookup while preserving the selected filters', async () => {
    const props = propsFor(() => Promise.reject(new Error('Not found')))
    render(renderForm(props))

    expect(
      await screen.findByText(/Unable to load bibliography entry missing/),
    ).toBeVisible()
    expect(screen.getByTitle('missing')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(props.navigate).toHaveBeenCalledWith({
      pathname: '/library/search/',
      search: '?bibId=missing&findspotId=7&label=missing&site=Uruk',
    })
  })

  it('announces a failed current lookup after the route changes', async () => {
    const props = propsFor(() => Promise.reject(new Error('Network failure')))
    const { rerender } = render(
      renderForm({ ...props, fragmentQuery: { findspotId: 7 } }),
    )

    rerender(renderForm(props))

    expect(
      await screen.findByText(/Unable to load bibliography entry missing/),
    ).toBeVisible()
  })

  it('ignores a rejected lookup after another reference replaces it', async () => {
    const pending = pendingReference()
    const props = propsFor(() => pending.promise)
    const { rerender } = render(renderForm(props))

    rerender(
      renderForm({
        ...props,
        fragmentQuery: { bibId: 'current', bibLabel: 'Current reference' },
      }),
    )
    await act(async () => pending.reject(new Error('Stale lookup failed')))

    expect(
      screen.queryByText(/Unable to load bibliography entry/),
    ).not.toBeInTheDocument()
    expect(screen.getByTitle('Current reference')).toBeVisible()
  })

  it('handles rejection after the form unmounts', async () => {
    const pending = pendingReference()
    const { unmount } = render(renderForm(propsFor(() => pending.promise)))

    unmount()
    await act(async () => pending.reject(new Error('Unmounted lookup failed')))

    expect(
      screen.queryByText(/Unable to load bibliography entry/),
    ).not.toBeInTheDocument()
  })

  it('lets the user clear a failed reference without dropping the findspot filter', async () => {
    const props = propsFor(() => Promise.reject(new Error('Not found')))
    render(renderForm(props))
    await screen.findByText(/Unable to load bibliography entry missing/)

    await userEvent.click(
      screen.getByLabelText('Select bibliography reference'),
    )
    await userEvent.keyboard('{Backspace}')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(
      screen.queryByText(/Unable to load bibliography entry/),
    ).not.toBeInTheDocument()
    expect(props.navigate).toHaveBeenCalledWith({
      pathname: '/library/search/',
      search: '?findspotId=7&site=Uruk',
    })
  })

  it('clears the failed reference and its alert when query parameters are removed', async () => {
    const props = propsFor(() => Promise.reject(new Error('Not found')))
    const { rerender } = render(renderForm(props))
    await screen.findByText(/Unable to load bibliography entry missing/)

    rerender(renderForm({ ...props, fragmentQuery: undefined }))

    expect(
      screen.queryByText(/Unable to load bibliography entry/),
    ).not.toBeInTheDocument()
    expect(screen.queryByTitle('missing')).not.toBeInTheDocument()
    expect(screen.queryByText(/limited to findspot/)).not.toBeInTheDocument()
  })

  it('keeps the shared form routed to the selected research project', async () => {
    const props = searchFormProps({ project: 'CAIC' })
    render(renderForm(props))

    await userEvent.click(
      screen.getByRole('button', { name: 'Search in CAIC' }),
    )

    expect(props.navigate).toHaveBeenCalledWith({
      pathname: '/projects/caic/search/',
      search: '?',
    })
  })

  it.each(['resolve', 'reject'] as const)(
    'ignores a same-ID lookup that later %ss after the URL supplies its label',
    async (outcome) => {
      const pending = pendingReference()
      const props = propsFor(() => pending.promise)
      const { rerender } = render(renderForm(props))
      rerender(
        renderForm({
          ...props,
          fragmentQuery: {
            bibId: 'missing',
            bibLabel: 'Supplied current label',
          },
        }),
      )

      await act(async () => finishStaleLookup(pending, outcome))

      expect(screen.getByTitle('Supplied current label')).toBeVisible()
      expect(
        screen.queryByText(/Unable to load bibliography entry/),
      ).not.toBeInTheDocument()
    },
  )

  it.each(['resolve', 'reject'] as const)(
    'ignores an earlier lookup that %ss after navigating A to B to A',
    async (outcome) => {
      const pending = pendingReference()
      const latest = new BibliographyEntry({
        id: 'missing',
        title: 'Latest label',
      })
      const find = jest
        .fn()
        .mockReturnValueOnce(pending.promise)
        .mockResolvedValue(latest)
      const props = propsFor(find)
      const { rerender } = render(renderForm(props))
      rerender(
        renderForm({
          ...props,
          fragmentQuery: { bibId: 'B', bibLabel: 'Different reference' },
        }),
      )
      rerender(renderForm(props))
      expect(await screen.findByTitle(latest.label.trim())).toBeVisible()

      await act(async () => finishStaleLookup(pending, outcome))

      expect(screen.getByTitle(latest.label.trim())).toBeVisible()
      expect(
        screen.queryByText(/Unable to load bibliography entry/),
      ).not.toBeInTheDocument()
    },
  )
})
