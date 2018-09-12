import React from 'react'
import { render, cleanup } from 'react-testing-library'
import ErrorAlert from './ErrorAlert'

afterEach(cleanup)

it('Displays error message', async () => {
  const error = { message: 'error message' }
  const { container } = render(<ErrorAlert error={error} />)

  expect(container).toHaveTextContent(error.message)
})

it('Displays nothing if no error provided', async () => {
  const { container } = render(<ErrorAlert error={null} />)

  expect(container.textContent).toEqual('')
})
