import React from 'react'
import { render, screen } from '@testing-library/react'

import ReferenceList from './ReferenceList'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import createReference from 'bibliography/application/createReference'
import { productionSummaryReferences } from 'test-support/fragment-query-summary'

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
it('keeps distinct id-only references in separate groups', () => {
  const references = productionSummaryReferences.map(createReference)
  render(<ReferenceList references={references} />)

  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(screen.getByText(/RN52/)).toBeVisible()
  expect(screen.getByText(/RN54/)).toBeVisible()
})
