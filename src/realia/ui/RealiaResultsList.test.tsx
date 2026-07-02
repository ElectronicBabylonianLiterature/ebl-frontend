import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaResultsList from 'realia/ui/RealiaResultsList'
import {
  realiaEntryFactory,
  reallexikonEntryFactory,
  afoRegisterEntryFactory,
} from 'test-support/realia-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'

function renderList(
  entries: Parameters<typeof RealiaResultsList>[0]['entries'],
) {
  render(
    <MemoryRouter>
      <RealiaResultsList entries={entries} />
    </MemoryRouter>,
  )
}

describe('RealiaResultsList', () => {
  it('shows "No results found." when entries are empty', () => {
    renderList([])
    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('renders a link for each entry', () => {
    const entries = realiaEntryFactory.buildList(2)
    renderList(entries)
    entries.forEach((entry) => {
      const link = screen.getByRole('link', { name: entry.id })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        `/tools/realia/${encodeURIComponent(entry.id)}`,
      )
    })
  })

  it('renders BEM class on list and items', () => {
    const entries = realiaEntryFactory.buildList(1)
    renderList(entries)
    expect(screen.getByRole('list')).toHaveClass('realia-results-list')
    expect(screen.getAllByRole('listitem')[0]).toHaveClass(
      'realia-results-list__item',
    )
  })

  it('renders a type chip with the backend label for each type', () => {
    const entry = realiaEntryFactory.build({
      type: ['Divine names', 'Royal names'],
    })
    renderList([entry])
    expect(screen.getByText('Divine names')).toHaveClass(
      'realia-results-list__type',
    )
    expect(screen.getByText('Royal names')).toHaveClass(
      'realia-results-list__type',
    )
  })

  it('renders the related terms line without an "also" label', () => {
    const entry = realiaEntryFactory.build({ relatedTerms: ['pig', 'swine'] })
    renderList([entry])
    expect(screen.getByText('pig, swine')).toHaveClass(
      'realia-results-list__terms',
    )
    expect(screen.queryByText('also')).not.toBeInTheDocument()
  })

  it('omits the related terms line when there are no related terms', () => {
    const entry = realiaEntryFactory.build({
      relatedTerms: [],
      reallexikon: [],
      afoRegister: [],
      references: [],
      wikidataId: [],
    })
    renderList([entry])
    expect(
      screen.queryByText(
        (_, element) =>
          element?.classList.contains('realia-results-list__terms') ?? false,
      ),
    ).not.toBeInTheDocument()
  })

  it('renders RlA, AfO and References counts', () => {
    const entry = realiaEntryFactory.build({
      reallexikon: reallexikonEntryFactory.buildList(2),
      afoRegister: afoRegisterEntryFactory.buildList(3),
      references: referenceFactory.buildList(1),
      wikidataId: [],
    })
    renderList([entry])
    const item = screen.getByRole('listitem')
    expect(within(item).getByText('RlA')).toBeInTheDocument()
    expect(within(item).getByText('AfO')).toBeInTheDocument()
    expect(within(item).getByText('References')).toBeInTheDocument()
    const counts = within(item)
      .getAllByText(/^\(\d+\)$/)
      .map((node) => node.textContent)
    expect(counts).toEqual(['(2)', '(3)', '(1)'])
  })

  it('renders a Wikidata badge without a count when a wikidata id is present', () => {
    const entry = realiaEntryFactory.build({ wikidataId: ['Q787'] })
    renderList([entry])
    const badge = screen.getByText('Wikidata')
    expect(badge).toHaveClass('realia-results-list__source')
    expect(badge).toHaveTextContent(/^Wikidata$/)
  })

  it('omits the source row when an entry has no sources', () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [],
      references: [],
      wikidataId: [],
    })
    renderList([entry])
    expect(screen.queryByText('RlA')).not.toBeInTheDocument()
    expect(screen.queryByText('Wikidata')).not.toBeInTheDocument()
  })
})
