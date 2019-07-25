import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'

import CompactCitation from './CompactCitation'

test('Shows compact citation', async () => {
  const reference = await factory.build('reference')
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(reference.compactCitation)
})
