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

  const setup = (): void => {
    fragment = fragmentFactory.build({ publication: publication })
    container = render(<TransliterationHeader fragment={fragment} />).container
  }

  it(`Renders description`, () => {
    setup()
    expect(container).toHaveTextContent(fragment.description.replace('\n', ''))
  })

  it(`Renders publication`, () => {
    setup()
    expect(container).toHaveTextContent(expectedPublication)
  })
})
