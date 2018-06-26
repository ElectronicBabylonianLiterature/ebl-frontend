import React from 'react'
import {render, cleanup} from 'react-testing-library'
import Spinner from './Spinner'

afterEach(cleanup)

it('Has loading indicator', () => {
  const {container} = render(<Spinner />)
  expect(container).toHaveTextContent('Loading...')
})

it('Shows children', () => {
  const {container} = render(<Spinner>Spinning</Spinner>)
  expect(container).toHaveTextContent('Spinning')
})
