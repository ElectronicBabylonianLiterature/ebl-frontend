import React from 'react'
import { render } from '@testing-library/react'
import { List } from 'immutable'

import UncuratedReferencesList from './UncuratedReferencesList'
import { UncuratedReference } from 'fragmentarium/fragment'

it('List all references', async () => {
  const references = List.of(
    UncuratedReference({ document: 'Title One', pages: List() }),
    UncuratedReference({ document: 'Title Two', pages: List.of(2, 3) })
  )
  const { container } = render(
    <UncuratedReferencesList uncuratedReferences={references} />
  )
  expect(container).toHaveTextContent('Title OneTitle Two: 2, 3')
})
