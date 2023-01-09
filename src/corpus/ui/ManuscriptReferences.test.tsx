import React from 'react'
import { render, screen } from '@testing-library/react'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import ManuscriptReferences from './ManuscriptReferences'

const references = referenceFactory.buildList(1)

test.each(references[0].authors)('Authors are shown', async (name) => {
  render(<ManuscriptReferences references={references} />)
  expect(screen.getByRole('list')).toHaveTextContent(name)
})
