import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { List } from 'immutable'
import UncuratedReferences from './UncuratedReferences'

let references
let element

test.each([
  [0, '0 uncurated references'],
  [1, '1 uncurated reference'],
  [2, '2 uncurated references']
])('%i references', async (numberOfReferences, expectedText) => {
  references = numberOfReferences > 0
    ? List(await factory.buildMany('uncuratedReference', numberOfReferences))
    : List()
  element = render(<UncuratedReferences uncuratedReferences={references} />)
  expect(element.getByText(expectedText)).toBeTruthy()
})
