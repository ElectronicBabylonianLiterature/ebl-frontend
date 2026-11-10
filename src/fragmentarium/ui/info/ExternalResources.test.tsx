import React from 'react'
import { render, screen } from '@testing-library/react'
import ExternalResources from 'fragmentarium/ui/info/ExternalResources'

import { fragmentFactory } from 'test-support/fragment-fixtures'
import { externalNumbersFactory } from 'test-support/fragment-data-fixtures'
import {
  externalResourceLinks,
  externalResourceNumbers,
} from 'test-support/external-resources-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

let fragment: Fragment
let container: HTMLElement

describe('external resources', () => {
  function setup(): void {
    fragment = fragmentFactory.build(
      {},
      {
        associations: {
          externalNumbers: externalNumbersFactory.build(
            externalResourceNumbers,
          ),
        },
      },
    )
    container = render(<ExternalResources fragment={fragment} />).container
  }

  test.each(externalResourceLinks)(
    '%s number is shown',
    async (label, link, number) => {
      setup()
      expect(screen.getByLabelText(`${label} text ${number}`)).toHaveAttribute(
        'href',
        `${link}${encodeURIComponent(number)}`,
      )
    },
  )
  test('Snapshot', async () => {
    setup()
    expect(container).toMatchSnapshot()
  })
})
