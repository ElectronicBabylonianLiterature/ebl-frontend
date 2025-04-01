import React from 'react'
import { render, screen } from '@testing-library/react'
import UncuratedReferences from './UncuratedReferences'
import { uncuratedReferenceFactory } from 'test-support/fragment-data-fixtures'
import { UncuratedReference } from 'fragmentarium/domain/fragment'

let references: UncuratedReference[]

test.each([
  [0, '0 uncurated references'],
  [1, '1 uncurated reference'],
  [2, '2 uncurated references'],
])('%i references', (numberOfReferences, expectedText) => {
  references =
    numberOfReferences > 0
      ? uncuratedReferenceFactory.buildList(numberOfReferences)
      : []
  render(<UncuratedReferences uncuratedReferences={references} />)
  expect(screen.getByText(expectedText)).toBeInTheDocument()
})

test('displays search term in parentheses', () => {
  const referencesWithSearchTerm: UncuratedReference[] = [
    { document: 'doc1.pdf', pages: [1, 2], searchTerm: 'Term A' },
    { document: 'doc2.pdf', pages: [1], searchTerm: 'Term A' },
  ]
  render(<UncuratedReferences uncuratedReferences={referencesWithSearchTerm} />)

  expect(screen.getByText('2 uncurated references')).toBeInTheDocument()
})
