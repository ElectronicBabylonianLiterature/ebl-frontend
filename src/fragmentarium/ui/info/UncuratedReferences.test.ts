import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import UncuratedReferences from './UncuratedReferences'

let references
let element

test.each([
  [0, '0 uncurated references'],
  [1, '1 uncurated reference'],
  [2, '2 uncurated references']
])('%i references', async (numberOfReferences, expectedText) => {
  references =
    numberOfReferences > 0
      ? await factory.buildMany('uncuratedReference', numberOfReferences)
      : []
  element = render(<UncuratedReferences uncuratedReferences={references} />)
  expect(element.getByText(expectedText)).toBeTruthy()
})
