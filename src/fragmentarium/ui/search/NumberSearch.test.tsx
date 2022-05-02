import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import NumberSearch from './NumberSearch'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

const number = 'K.003292'
let fragments: Fragment[]
let fragmentSearchService

beforeEach(async () => {
  fragments = fragmentFactory.buildList(2)
  fragmentSearchService = {
    searchNumber: jest.fn(),
  }
  fragmentSearchService.searchNumber.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  render(
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
    expect(await screen.findByText(fragment.number)).toHaveAttribute(
      'href',
      `/fragmentarium/${fragment.number}`
    )
  }
})
