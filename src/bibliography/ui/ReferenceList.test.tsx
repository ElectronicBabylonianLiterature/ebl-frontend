import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'

import ReferenceList from './ReferenceList'

it('List all references', async () => {
  const references = await factory.buildMany('reference', 2)
  const { container } = render(<ReferenceList references={references} />)
  for (const reference of references) {
    expect(container).toHaveTextContent(reference.primaryAuthor)
  }
})

it('Displays placeholder if no references', async () => {
  const { container } = render(<ReferenceList references={[]} />)
  expect(container).toHaveTextContent('No references')
})
