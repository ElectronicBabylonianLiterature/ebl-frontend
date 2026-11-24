import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaResultsList from 'realia/ui/RealiaResultsList'
import {
  afoRegisterEntryFactory,
  eblRealiaEntryFactory,
  realiaEntryFactory,
  reallexikonEntryFactory,
} from 'test-support/realia-fixtures'

const aquariiHeadword = 'φ, χ, ψ¹, ψ², ψ³ Aquarii?'

function renderList(
  entries: Parameters<typeof RealiaResultsList>[0]['entries'],
): void {
  render(
    <MemoryRouter>
      <RealiaResultsList entries={entries} />
    </MemoryRouter>,
  )
}

function sourceLabels(): string[] {
  return Array.from(
    document.querySelectorAll('.realia-results-list__source'),
  ).map((badge) => badge.textContent ?? '')
}

describe('RealiaResultsList reference types', () => {
  it('shows the eBL badge with its entry count for a star', () => {
    renderList([
      realiaEntryFactory.build({
        reallexikon: [],
        afoRegister: [],
        referenceType: ['eBL'],
        eblRealia: eblRealiaEntryFactory.buildList(1),
      }),
    ])
    expect(sourceLabels()).toEqual(['eBLeBL Realia(1)'])
  })

  it('shows RlA, AfO and eBL badges in order for an attached entry', () => {
    renderList([
      realiaEntryFactory.build({
        reallexikon: reallexikonEntryFactory.buildList(1),
        afoRegister: afoRegisterEntryFactory.buildList(2),
        referenceType: ['RlA', 'AfO', 'eBL'],
        eblRealia: eblRealiaEntryFactory.buildList(1),
      }),
    ])
    expect(sourceLabels()).toEqual([
      'RlAReallexikon der Assyriologie und Vorderasiatischen Archäologie(1)',
      'AfOAfO-Register Realien(2)',
      'eBLeBL Realia(1)',
    ])
  })

  it('percent-encodes a headword with a question mark and commas', () => {
    renderList([realiaEntryFactory.build({ id: aquariiHeadword })])
    const link = screen.getByRole('link', { name: aquariiHeadword })
    expect(link).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent(aquariiHeadword)}`,
    )
    expect(link.getAttribute('href')).not.toContain('?')
  })

  it('explains the reference type abbreviations', () => {
    renderList([
      realiaEntryFactory.build({ referenceType: ['RlA'], reallexikon: [] }),
    ])
    const textOf = (role: string): string[] =>
      screen.getAllByRole(role).map((element) => element.textContent ?? '')
    expect(textOf('term')).toEqual(['RlA', 'AfO', 'eBL'])
    expect(textOf('definition')).toEqual([
      'Reallexikon der Assyriologie und Vorderasiatischen Archäologie',
      'AfO-Register Realien',
      'eBL Realia',
    ])
  })

  it('omits the legend when no entry has a reference type', () => {
    renderList([
      realiaEntryFactory.build({
        referenceType: [],
        reallexikon: [],
        afoRegister: [],
        eblRealia: [],
      }),
    ])
    expect(screen.queryByRole('term')).not.toBeInTheDocument()
  })
})
