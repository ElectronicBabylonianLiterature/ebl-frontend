import React from 'react'
import {render, cleanup} from 'react-testing-library'
import Error from './Error'

afterEach(cleanup)

it('Displays error message', async () => {
  const error = {message: 'error message'}
  const {container} = render(<Error error={error} />)

  expect(container).toHaveTextContent(error.message)
})

it('Displays nothing if no error provided', async () => {
  const {container} = render(<Error error={null} />)

  expect(container.textContent).toEqual('')
})
