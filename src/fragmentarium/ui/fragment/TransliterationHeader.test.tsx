import React from 'react'
import { render } from '@testing-library/react'

import TransliterationHeader from './TransliterationHeader'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

describe.each([
  ['', '(Publication: - )'],
  ['George, Gilgamesh II 047, d', '(Publication: George, Gilgamesh II 047, d)'],
])('Publication "%s"', (publication, expectedPublication) => {
  let fragment: Fragment
  let container: HTMLElement

  beforeEach(() => {
    fragment = fragmentFactory.build({ publication: publication })
    container = render(<TransliterationHeader fragment={fragment} />).container
  })

  it(`Renders description`, () => {
    expect(container).toHaveTextContent(fragment.description.replace('\n', ''))
  })

  it(`Renders publication`, () => {
    expect(container).toHaveTextContent(expectedPublication)
  })
})
