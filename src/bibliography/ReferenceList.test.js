import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import { List } from 'immutable'

import ReferenceList from './ReferenceList'

it('List all references', async () => {
  const references = List(await factory.buildMany('reference', 2))
  const { container } = render(<ReferenceList references={references} />)
  for (let reference of references) {
    expect(container).toHaveTextContent(reference.document.author)
  }
})

it('Displays placeholder if no references', async () => {
  const { container } = render(<ReferenceList references={List()} />)
  expect(container).toHaveTextContent('No references')
})
