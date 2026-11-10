import React from 'react'
import { render, screen } from '@testing-library/react'
import ExternalResources from 'fragmentarium/ui/info/ExternalResources'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { externalResourceLinks } from 'test-support/external-resources-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

let fragment: Fragment

describe('missing external resources', () => {
  function setup(): void {
    fragment = fragmentFactory.build(
      {},
      {
        associations: {
          externalNumbers: {},
        },
      },
    )
    render(<ExternalResources fragment={fragment} />)
  }

  test.each(externalResourceLinks.map(([label]) => label))(
    'Missing %s number is not shown',
    (label) => {
      setup()
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    },
  )
})
