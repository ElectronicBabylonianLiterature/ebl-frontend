import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, render } from '@testing-library/react'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import ReferenceSearch from './ReferenceSearch'

const id = 'RN.0'
const pages = ''

let fragments
let fragmentSearchService
let element

beforeEach(async () => {
  fragments = await factory.buildMany('fragment', 2)
  fragmentSearchService = {
    searchReference: jest.fn(),
  }
  fragmentSearchService.searchReference.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  element = render(
    <MemoryRouter>
      <ReferenceSearch
        id={id}
        pages={pages}
        fragmentSearchService={fragmentSearchService}
      />
    </MemoryRouter>
  )
})

it('Searches for the given parameters', () => {
  expect(fragmentSearchService.searchReference).toBeCalledWith(id, pages)
})

it('Displays and links results', async () => {
  for (const fragment of fragments) {
    expect(await element.findByText(fragment.number)).toHaveAttribute(
      'href',
      `/fragmentarium/${fragment.number}`
    )
  }
})
