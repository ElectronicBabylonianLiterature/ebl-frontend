import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import UncuratedReferences from './UncuratedReferences'
import { uncuratedReferenceFactory } from 'test-support/fragment-fixtures'
import { UncuratedReference } from 'fragmentarium/domain/fragment'

let references: UncuratedReference[]
let element: RenderResult

test.each([
  [0, '0 uncurated references'],
  [1, '1 uncurated reference'],
  [2, '2 uncurated references'],
])('%i references', (numberOfReferences, expectedText) => {
  references =
    numberOfReferences > 0
      ? uncuratedReferenceFactory.buildList(numberOfReferences)
      : []
  element = render(<UncuratedReferences uncuratedReferences={references} />)
  expect(element.getByText(expectedText)).toBeInTheDocument()
})
