import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

import TransliterationHeader from './TransliterationHeader'

describe.each(
  [
    ['', '(Publication: - )'],
    ['George, Gilgamesh II 047, d', '(Publication: George, Gilgamesh II 047, d)']
  ]
)('Publication "%s"', (publication, expectedPublication) => {
  let fragment
  let container

  beforeEach(async () => {
    fragment = await factory.build('fragment', { publication: publication })
    container = render(<TransliterationHeader fragment={fragment} />).container
  })

  it(`Renders description`, () => {
    expect(container).toHaveTextContent(fragment.description.replace('\n', ''))
  })

  it(`Renders publication`, () => {
    expect(container).toHaveTextContent(expectedPublication)
  })
})
