import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

import FullCitation from './FullCitation'

let entry
let reference
let container

beforeEach(async () => {
  entry = await factory.build('bibliographyEntry')
  reference = await factory.build('reference', { document: entry })
  container = render(<FullCitation reference={reference} />).container
})

test('Formatted citation', async () => {
  expect(container).toHaveTextContent(entry.title)
})

test('Notes', async () => {
  expect(container).toHaveTextContent(reference.notes)
})
