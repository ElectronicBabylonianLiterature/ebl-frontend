import React from 'react'
import {render} from 'react-testing-library'
import Word from './Word'

it('renders markdown as HTML', () => {
  const {container} = render(<Word value={{source: '**lemma**'}} />)
  expect(container.innerHTML).toContain('<strong>lemma</strong>')
})
