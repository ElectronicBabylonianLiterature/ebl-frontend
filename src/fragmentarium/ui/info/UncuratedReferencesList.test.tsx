import React from 'react'
import { render, screen } from '@testing-library/react'
import UncuratedReferencesList from './UncuratedReferencesList'
import { UncuratedReference } from 'fragmentarium/domain/fragment'

it('List references with searchTerm and sorted correctly', () => {
  const references: UncuratedReference[] = [
    { document: 'Title One', pages: [1, 2], searchTerm: 'apple' },
    { document: 'Title Two', pages: [2, 3], searchTerm: 'banana' },
    { document: 'Title Three', pages: [3, 4] },
  ]

  render(<UncuratedReferencesList uncuratedReferences={references} />)

  const listItems = screen.getAllByRole('listitem')
  expect(listItems).toHaveLength(3)
  expect(listItems[0]).toHaveTextContent('(apple) Title One: 1, 2')
  expect(listItems[1]).toHaveTextContent('(banana) Title Two: 2, 3')
  expect(listItems[2]).toHaveTextContent('Title Three: 3, 4')
})
