// @flow
import React from 'react'
import { render } from '@testing-library/react'
import { List } from 'immutable'
import type { UncuratedReference } from '../fragment'

import UncuratedReferencesList from './UncuratedReferencesList'

it('List all references', async () => {
  const references: List<UncuratedReference> = List.of(
    { document: 'Title One', pages: [] },
    { document: 'Title Two', pages: [2, 3] }
  )
  const { container } = render(
    <UncuratedReferencesList uncuratedReferences={references} />
  )
  expect(container).toHaveTextContent('Title OneTitle Two: 2, 3')
})
