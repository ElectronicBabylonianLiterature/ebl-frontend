import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Promise } from 'bluebird'
import FragmentPager from './FragmentPager'

const number = 'K.00000'
let fragmentService
let fragmentPagerData

const setup = async (): Promise<void> => {
  fragmentService = {
    fragmentPager: jest.fn(),
  }
  fragmentPagerData = {
    next: 'K.00001',
    previous: 'J.99999',
  }
  fragmentService.fragmentPager.mockReturnValue(
    Promise.resolve(fragmentPagerData),
  )
  render(
    <MemoryRouter>
      <FragmentPager
        fragmentNumber={number}
        fragmentService={fragmentService}
      ></FragmentPager>
    </MemoryRouter>,
  )
  await screen.findByText('K.00000')
}
it.each([
  ['Previous', 'previous'],
  ['Next', 'next'],
])('Test Links to %s Button', async (label, expected) => {
  await setup()
  expect(screen.getByLabelText(label)).toHaveAttribute(
    'href',
    `/library/${encodeURIComponent(fragmentPagerData[expected])}`,
  )
})

it('Renders children', async () => {
  await setup()
  expect(screen.getByText(number)).toBeInTheDocument()
})
