import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'

import { factory } from 'factory-girl'
import SignsSearch from 'signs/ui/search/SignsSearch'
import Sign from 'signs/domain/Sign'
import SignsService from 'signs/application/SignsService'

jest.mock('signs/application/SignsService')

let signs: Sign[]
const signsService = new (SignsService as jest.Mock<
  jest.Mocked<SignsService>
>)()
const query = {
  value: 'bu',
  subIndex: 1,
  listsName: undefined,
  listsNumber: undefined,
  isIncludeHomophones: undefined,
  isComposite: undefined,
}
async function renderSignSearch(): Promise<void> {
  render(
    <MemoryRouter>
      <SignsSearch signQuery={query} signService={signsService} />
    </MemoryRouter>
  )
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
}

describe('Display Search Results', () => {
  beforeEach(async () => {
    signs = await factory.buildMany('sign', 2)
    signsService.search.mockReturnValue(Promise.resolve(signs))
    await renderSignSearch()
  })
  it('Searches with the query', () => {
    expect(signsService.search).toBeCalledWith(query)
  })
  it('Displays results', async () => {
    expect(screen.getByText(signs[1].name)).toBeInTheDocument()
  })
})
