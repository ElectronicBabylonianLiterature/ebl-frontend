import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

import CompactCitation from './CompactCitation'

test('Shows all elements', async () => {
  const reference = await factory.build('reference')
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.document.author}, ${reference.document.year}: ${reference.pages} [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})

test('Empty elements are hidden', async () => {
  const reference = await factory.build('reference', { pages: '', linesCited: [] })
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.document.author}, ${reference.document.year} (${reference.typeAbbreviation})`
  )
})
