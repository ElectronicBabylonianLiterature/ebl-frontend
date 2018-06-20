import React from 'react'
import {render} from 'react-testing-library'
import Spinner from './Spinner'

it('Has loading indicator', () => {
  const {container} = render(<Spinner />)
  expect(container).toHaveTextContent('Loading...')
})
