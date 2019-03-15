import React from 'react'
import { render } from 'react-testing-library'
import { List } from 'immutable'

import UncuratedReferencesList from './UncuratedReferencesList'
import { UncuratedReference } from 'fragmentarium/fragment'

it('List all references', async () => {
  const references = List([
    new UncuratedReference({ document: 'Title One', pages: List() }),
    new UncuratedReference({ document: 'Title Two', pages: List([2, 3]) })
  ])
  const { container } = render(<UncuratedReferencesList uncuratedReferences={references} />)
  expect(container).toHaveTextContent('Title OneTitle Two: 2, 3')
})
