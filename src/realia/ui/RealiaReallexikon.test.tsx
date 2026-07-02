import React from 'react'
import { render, screen } from '@testing-library/react'
import { ReallexikonEntries } from 'realia/ui/RealiaReallexikon'
import { reallexikonEntryFactory } from 'test-support/realia-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'

it('shows the permission note at the very beginning of the RlA section', () => {
  render(<ReallexikonEntries entries={reallexikonEntryFactory.buildList(2)} />)
  const note = screen.getByText(/kind permission of the Reallexikon/)
  expect(note).toHaveTextContent('Bayerische Akademie der Wissenschaften')
  expect(note).toHaveTextContent('Walter de Gruyter')
})

it('offers an on-demand RlA page viewer for each article', () => {
  render(<ReallexikonEntries entries={reallexikonEntryFactory.buildList(2)} />)
  expect(screen.getAllByRole('button', { name: 'Show RlA page' })).toHaveLength(
    2,
  )
})

it('renders the reference list for an article that has one', () => {
  const entry = reallexikonEntryFactory.build({
    reference: referenceFactory.build(),
  })
  render(<ReallexikonEntries entries={[entry]} />)
  expect(screen.getByRole('list')).toBeInTheDocument()
})
