import React from 'react'
import { render } from 'react-testing-library'
import Spinner from './Spinner'

it('Has loading indicator', () => {
  const { container } = render(<Spinner loading />)
  expect(container).toHaveTextContent('Loading...')
})

it('Shows children', () => {
  const { container } = render(<Spinner loading>Spinning</Spinner>)
  expect(container).toHaveTextContent('Spinning')
})

it('Displays nothing if loading undefined', async () => {
  const { container } = render(<Spinner />)
  expect(container).toHaveTextContent('Loading...')
})

it('Displays nothing if loading false', async () => {
  const { container } = render(<Spinner loading={false} />)
  expect(container.textContent).toEqual('')
})
