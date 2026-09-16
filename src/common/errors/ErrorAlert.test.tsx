import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorAlert from './ErrorAlert'

it('Displays error message', async () => {
  const error = new Error('error message')
  render(<ErrorAlert error={error} />)

  expect(screen.getByText(error.message)).toBeInTheDocument()
})

it('Does not show a retry button when onRetry is not provided', async () => {
  const error = new Error('error message')
  render(<ErrorAlert error={error} />)

  expect(
    screen.queryByRole('button', { name: 'Retry' }),
  ).not.toBeInTheDocument()
})

it('Calls onRetry when the retry button is clicked', async () => {
  const error = new Error('error message')
  const onRetry = jest.fn()
  render(<ErrorAlert error={error} onRetry={onRetry} />)

  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

  expect(onRetry).toHaveBeenCalledTimes(1)
})

it('Displays nothing if no error provided', async () => {
  render(
    <div data-testid="wrapper">
      <ErrorAlert error={null} />
    </div>,
  )

  expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement()
})
