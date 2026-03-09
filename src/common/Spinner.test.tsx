import React from 'react'
import { render, screen } from '@testing-library/react'
import Spinner from './Spinner'

const defaultSpinnerText = 'Loading...'

it('Has loading indicator', () => {
  render(<Spinner loading />)
  expect(screen.getByText(defaultSpinnerText)).toBeInTheDocument()
})

it('Loading defaults to true', async () => {
  render(<Spinner />)
  expect(screen.getByText(defaultSpinnerText)).toBeInTheDocument()
})

it('Shows children', () => {
  const spinnerText = 'Spinning'
  render(<Spinner loading>{spinnerText}</Spinner>)
  expect(screen.getByText(spinnerText)).toBeInTheDocument()
})

it('Displays nothing if loading false', async () => {
  render(
    <div data-testid="wrapper">
      <Spinner loading={false} />
    </div>,
  )
  expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement()
})
