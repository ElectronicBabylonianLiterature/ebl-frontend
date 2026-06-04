import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaResultsList from 'realia/ui/RealiaResultsList'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

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

  it('renders subtitle with type label when type is present', () => {
    const entry = realiaEntryFactory.build({
      type: ['OBJECT_NAME'],
      relatedTerms: [],
    })
    renderList([entry])
    expect(screen.getByText(/— Object Name/)).toHaveClass(
      'realia-results-list__subtitle',
    )
  })

  it('renders subtitle with relatedTerms when type is empty', () => {
    const entry = realiaEntryFactory.build({
      type: [],
      relatedTerms: ['pig', 'swine'],
    })
    renderList([entry])
    expect(screen.getByText(/— pig, swine/)).toBeInTheDocument()
  })

  it('renders combined subtitle when both type and relatedTerms are present', () => {
    const entry = realiaEntryFactory.build({
      type: ['OBJECT_NAME'],
      relatedTerms: ['pig'],
    })
    renderList([entry])
    expect(screen.getByText(/— Object Name — pig/)).toBeInTheDocument()
  })

  it('renders no subtitle when type is empty and relatedTerms is empty', () => {
    const entry = realiaEntryFactory.build({ type: [], relatedTerms: [] })
    renderList([entry])
    expect(screen.queryByText(/—/)).not.toBeInTheDocument()
  })
})
