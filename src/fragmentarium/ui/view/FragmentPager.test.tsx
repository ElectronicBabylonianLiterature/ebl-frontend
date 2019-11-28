import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Promise } from 'bluebird'
import FragmentPager from './FragmentPager'

const number = 'K.00000'
let element
let fragmentService
let fragmentPagerData

beforeEach(async () => {
  fragmentService = {
    fragmentPager: jest.fn()
  }
  fragmentPagerData = {
    next: 'K.00001',
    previous: 'J.99999'
  }
  fragmentService.fragmentPager.mockReturnValue(
    Promise.resolve(fragmentPagerData)
  )
  element = render(
    <MemoryRouter>
      <FragmentPager
        fragmentNumber={number}
        fragmentService={fragmentService}
      ></FragmentPager>
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText('K.00000'))
})

it('Previous links to the "previous" fragment', () => {
  expect(element.getByLabelText('Previous')).toHaveAttribute(
    'href',
    `/fragmentarium/${encodeURIComponent(fragmentPagerData['previous'])}`
  )
})

it('Next links to the "next" fragment', () => {
  expect(element.getByLabelText('Next')).toHaveAttribute(
    'href',
    `/fragmentarium/${encodeURIComponent(fragmentPagerData['next'])}`
  )
})

it('Renders children', () => {
  expect(element.container).toHaveTextContent(number)
})
