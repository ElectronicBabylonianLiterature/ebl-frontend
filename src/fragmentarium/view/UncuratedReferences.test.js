import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { List } from 'immutable'
import UncuratedReferences from './UncuratedReferences'

test('Shows number of uncurated references', async () => {
  const references = List(await factory.buildMany('uncuratedReference', 3))
  const { container } = render(<UncuratedReferences uncuratedReferences={references} />)
  expect(container).toHaveTextContent(`${references.count()} uncurated references`)
})
