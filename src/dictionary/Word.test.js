import React from 'react'
import {render} from 'react-testing-library'
import Word from './Word'

import 'dom-testing-library/extend-expect'

it('renders markdown as HTML', () => {
  const word = render(<Word value={{source: '**lemma**'}} />)
  expect(word.container.innerHTML).toContain('<strong>lemma</strong>')
})
