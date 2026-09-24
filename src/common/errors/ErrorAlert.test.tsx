import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorAlert from 'common/errors/ErrorAlert'

it('Displays error message', async () => {
  const error = new Error('error message')
  render(<ErrorAlert error={error} />)

  expect(screen.getByRole('alert')).toHaveTextContent(error.message)
})

it('Displays HTML-like error messages as text', () => {
  const error = new Error('<img src=x onerror=alert(1)>')
  render(<ErrorAlert error={error} />)

  expect(screen.getByRole('alert')).toHaveTextContent(error.message)
  expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
})

it('Displays nothing if no error provided', async () => {
  render(
    <div data-testid="wrapper">
      <ErrorAlert error={null} />
    </div>,
  )

  expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement()
})
