import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import Promise from 'bluebird'
import NumberSearch from './NumberSearch'
import { factory } from 'factory-girl'

const number = 'K.003292'
let fragments
let fragmentSearchService
let element

beforeEach(async () => {
  fragments = await factory.buildMany('fragment', 2)
  fragmentSearchService = {
    searchNumber: jest.fn()
  }
  fragmentSearchService.searchNumber.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  element = render(
    <MemoryRouter>
      <NumberSearch
        number={number}
        fragmentSearchService={fragmentSearchService}
      />
    </MemoryRouter>
  )
})

it('Searches for the given parameters', () => {
  expect(fragmentSearchService.searchNumber).toBeCalledWith(number)
})

it('Displays and links results', async () => {
  for (const fragment of fragments) {
    expect(await element.findByText(fragment.number)).toHaveAttribute(
      'href',
      `/fragmentarium/${fragment.number}`
    )
  }
})
