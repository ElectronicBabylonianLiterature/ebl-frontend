import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import NumberSearch from './NumberSearch'
import { factory } from 'factory-girl'

const number = 'K.003292'
let fragments
let fragmentRepository
let element

beforeEach(async () => {
  fragments = await factory.buildMany('fragment', 2)
  fragmentRepository = {
    searchNumber: jest.fn()
  }
  fragmentRepository.searchNumber.mockReturnValueOnce(Promise.resolve(fragments))
  element = render(
    <MemoryRouter>
      <NumberSearch number={number} fragmentRepository={fragmentRepository} />
    </MemoryRouter>
  )
})

it('Searches for the given parameters', () => {
  expect(fragmentRepository.searchNumber).toBeCalledWith(number)
})

it('Displays and links results', async () => {
  await waitForElement(() => element.getByText(fragments[0]._id))
  for (let fragment of fragments) {
    expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
  }
})
