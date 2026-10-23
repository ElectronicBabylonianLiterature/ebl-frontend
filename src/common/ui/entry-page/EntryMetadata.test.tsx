import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  EntryMetadata,
  EntryMetadataItem,
} from 'common/ui/entry-page/EntrySection'

it('separates the items by one space, with none after the last', () => {
  render(
    <EntryMetadata>
      {['Q1', 'Q2'].map((id) => (
        <span key={id}>{id}</span>
      ))}
      {false}
      {''}
      <EntryMetadataItem label="Type">Objects</EntryMetadataItem>
    </EntryMetadata>,
  )
  expect(
    screen.getByRole('group', { name: 'Entry details' }),
  ).toHaveTextContent(/^Q1 Q2 Type: Objects$/, { normalizeWhitespace: false })
})
