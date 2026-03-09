import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorAlert from './ErrorAlert'

it('Displays error message', async () => {
  const error = new Error('error message')
  render(<ErrorAlert error={error} />)

  expect(screen.getByText(error.message)).toBeInTheDocument()
})

it('Displays nothing if no error provided', async () => {
  render(
    <div data-testid="wrapper">
      <ErrorAlert error={null} />
    </div>,
  )

  expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement()
})
