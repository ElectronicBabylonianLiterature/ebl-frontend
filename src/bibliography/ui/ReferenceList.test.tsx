import React from 'react'
import { render } from '@testing-library/react'

import ReferenceList from './ReferenceList'
import { referenceFactory } from 'test-support/bibliography-fixtures'

it('List all references', () => {
  const references = referenceFactory.buildList(2)
  const { container } = render(<ReferenceList references={references} />)
  for (const reference of references) {
    expect(container).toHaveTextContent(reference.primaryAuthor)
  }
})

it('Displays placeholder if no references', async () => {
  const { container } = render(<ReferenceList references={[]} />)
  expect(container).toHaveTextContent('No references')
})
