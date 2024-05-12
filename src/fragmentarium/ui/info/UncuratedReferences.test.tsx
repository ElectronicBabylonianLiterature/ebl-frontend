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
